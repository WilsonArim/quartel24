#!/usr/bin/env python3
"""
SOTA Autoimprove — Eval Harness (IMUTAVEL)

Inspirado no prepare.py do autoresearch do Karpathy.
Este script e a "verdade absoluta" do sistema: define como as skills sao avaliadas
e calcula a metrica escalar (pass_rate). O agente NAO pode modificar este ficheiro.

Uso:
    python eval-harness.py --skill-path SKILLS/<skill-name> --results-file results.tsv
    python eval-harness.py --skill-path SKILLS/<skill-name> --baseline  # sem skill (baseline)
    python eval-harness.py --list-skills SKILLS/  # listar skills com evals

A metrica:
    pass_rate = assertions_passed / total_assertions (0.0 a 1.0)
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


def load_evals(skill_path: str) -> dict:
    """Carrega evals.json de uma skill."""
    evals_path = os.path.join(skill_path, "evals", "evals.json")
    if not os.path.exists(evals_path):
        print(f"ERROR: No evals found at {evals_path}")
        print(f"Create evals first: {skill_path}/evals/evals.json")
        sys.exit(1)

    with open(evals_path, "r") as f:
        return json.load(f)


def run_eval_with_skill(prompt: str, skill_path: str, output_dir: str) -> dict:
    """Executa um eval prompt usando claude com a skill ativa."""
    os.makedirs(output_dir, exist_ok=True)

    # Construir o prompt com instrucao para ler a skill
    full_prompt = f"""First, read the skill at {skill_path}/SKILL.md and follow its instructions.

Then execute this task:
{prompt}

Save all outputs to {output_dir}/
When done, write a file {output_dir}/eval_output.md with a summary of what you produced."""

    try:
        result = subprocess.run(
            ["claude", "-p", full_prompt, "--max-turns", "25"],
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutos max por eval (igual ao autoresearch)
            cwd=os.getcwd(),
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "output_dir": output_dir,
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "TIMEOUT: eval exceeded 5 minute limit",
            "output_dir": output_dir,
        }
    except FileNotFoundError:
        return {
            "success": False,
            "stdout": "",
            "stderr": "ERROR: 'claude' CLI not found. Install Claude Code first.",
            "output_dir": output_dir,
        }


def run_eval_baseline(prompt: str, output_dir: str) -> dict:
    """Executa um eval prompt SEM skill (baseline)."""
    os.makedirs(output_dir, exist_ok=True)

    full_prompt = f"""{prompt}

Save all outputs to {output_dir}/
When done, write a file {output_dir}/eval_output.md with a summary of what you produced."""

    try:
        result = subprocess.run(
            ["claude", "-p", full_prompt, "--max-turns", "25"],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.getcwd(),
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "output_dir": output_dir,
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "stdout": "", "stderr": "TIMEOUT", "output_dir": output_dir}
    except FileNotFoundError:
        return {"success": False, "stdout": "", "stderr": "claude CLI not found", "output_dir": output_dir}


def grade_assertions(assertions: list, output_dir: str) -> list:
    """Avalia assertions contra os outputs produzidos.

    Usa o claude como grader independente para avaliar cada assertion.
    """
    results = []

    # Ler todos os ficheiros de output
    output_files = []
    for root, dirs, files in os.walk(output_dir):
        for f in files:
            filepath = os.path.join(root, f)
            try:
                with open(filepath, "r") as fh:
                    content = fh.read()
                output_files.append({"path": filepath, "content": content[:5000]})
            except (UnicodeDecodeError, IsADirectoryError):
                output_files.append({"path": filepath, "content": "[binary file]"})

    if not output_files:
        # Sem outputs = todas as assertions falham
        for a in assertions:
            results.append({"name": a["name"], "passed": False, "evidence": "No output files produced"})
        return results

    outputs_text = "\n\n".join(
        [f"--- {f['path']} ---\n{f['content']}" for f in output_files]
    )

    # Grading prompt
    grading_prompt = f"""You are an objective grader. Evaluate each assertion against the outputs below.
For each assertion, respond with PASS or FAIL and a brief evidence quote.

OUTPUTS:
{outputs_text}

ASSERTIONS TO EVALUATE:
{json.dumps(assertions, indent=2)}

Respond in JSON format:
[
  {{"name": "assertion-name", "passed": true/false, "evidence": "brief quote or reason"}}
]

Be strict: if the assertion is not clearly met, it fails. No partial credit."""

    try:
        result = subprocess.run(
            ["claude", "-p", grading_prompt, "--max-turns", "3"],
            capture_output=True,
            text=True,
            timeout=120,
        )
        # Extrair JSON da resposta
        output = result.stdout.strip()
        # Tentar encontrar o JSON array na resposta
        start = output.find("[")
        end = output.rfind("]") + 1
        if start >= 0 and end > start:
            results = json.loads(output[start:end])
        else:
            # Fallback: todas falham se nao conseguir parsear
            for a in assertions:
                results.append({"name": a["name"], "passed": False, "evidence": "Grading parse error"})
    except Exception as e:
        for a in assertions:
            results.append({"name": a["name"], "passed": False, "evidence": f"Grading error: {str(e)}"})

    return results


def calculate_pass_rate(grading_results: list) -> float:
    """Calcula pass_rate: assertions_passed / total_assertions."""
    if not grading_results:
        return 0.0
    passed = sum(1 for r in grading_results if r.get("passed", False))
    return passed / len(grading_results)


def append_results(results_file: str, commit: str, skill: str, pass_rate: float,
                   prev_rate: float, status: str, hypothesis: str):
    """Append uma linha ao results.tsv."""
    timestamp = datetime.now(timezone.utc).isoformat()

    # Criar ficheiro com header se nao existe
    if not os.path.exists(results_file):
        with open(results_file, "w") as f:
            f.write("commit\tskill\tpass_rate\tprev_rate\tstatus\thypothesis\ttimestamp\n")

    with open(results_file, "a") as f:
        f.write(f"{commit}\t{skill}\t{pass_rate:.4f}\t{prev_rate:.4f}\t{status}\t{hypothesis}\t{timestamp}\n")


def get_current_commit() -> str:
    """Retorna o hash curto do commit atual."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True
        )
        return result.stdout.strip()
    except Exception:
        return "no-git"


def get_last_pass_rate(results_file: str, skill_name: str) -> float:
    """Retorna o ultimo pass_rate registado para uma skill (status=keep)."""
    if not os.path.exists(results_file):
        return 0.0

    last_rate = 0.0
    with open(results_file, "r") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 5 and parts[1] == skill_name and parts[4] == "keep":
                try:
                    last_rate = float(parts[2])
                except ValueError:
                    pass
    return last_rate


def list_skills_with_evals(skills_dir: str):
    """Lista todas as skills que tem evals definidos."""
    skills_path = Path(skills_dir)
    print(f"\n{'Skill':<35} {'Evals':<8} {'Assertions':<12} {'Path'}")
    print("-" * 90)

    for skill_dir in sorted(skills_path.iterdir()):
        if not skill_dir.is_dir():
            continue
        evals_file = skill_dir / "evals" / "evals.json"
        if evals_file.exists():
            with open(evals_file) as f:
                data = json.load(f)
            num_evals = len(data.get("evals", []))
            num_assertions = sum(
                len(e.get("assertions", []))
                for e in data.get("evals", [])
            )
            print(f"  {skill_dir.name:<33} {num_evals:<8} {num_assertions:<12} {evals_file}")
        # Tambem verificar subpastas (SECURITY/*)
        for sub in sorted(skill_dir.iterdir()):
            if sub.is_dir():
                sub_evals = sub / "evals" / "evals.json"
                if sub_evals.exists():
                    with open(sub_evals) as f:
                        data = json.load(f)
                    num_evals = len(data.get("evals", []))
                    num_assertions = sum(
                        len(e.get("assertions", []))
                        for e in data.get("evals", [])
                    )
                    rel_name = f"{skill_dir.name}/{sub.name}"
                    print(f"  {rel_name:<33} {num_evals:<8} {num_assertions:<12} {sub_evals}")

    print()


def main():
    parser = argparse.ArgumentParser(description="SOTA Autoimprove Eval Harness")
    parser.add_argument("--skill-path", help="Path to skill directory")
    parser.add_argument("--results-file", default="autoimprove-workspace/results.tsv",
                        help="Path to results.tsv")
    parser.add_argument("--baseline", action="store_true",
                        help="Run without skill (baseline comparison)")
    parser.add_argument("--list-skills", metavar="SKILLS_DIR",
                        help="List all skills with evals")
    parser.add_argument("--hypothesis", default="manual eval run",
                        help="Description of what was changed")
    parser.add_argument("--output-dir", default="autoimprove-workspace/evals",
                        help="Directory for eval outputs")

    args = parser.parse_args()

    if args.list_skills:
        list_skills_with_evals(args.list_skills)
        return

    if not args.skill_path:
        parser.error("--skill-path is required (or use --list-skills)")

    # Carregar evals
    evals_data = load_evals(args.skill_path)
    skill_name = evals_data.get("skill_name", os.path.basename(args.skill_path))
    evals = evals_data.get("evals", [])

    if not evals:
        print(f"ERROR: No eval entries in {args.skill_path}/evals/evals.json")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"SOTA AUTOIMPROVE — Eval Harness")
    print(f"Skill: {skill_name}")
    print(f"Evals: {len(evals)}")
    print(f"Mode: {'BASELINE (no skill)' if args.baseline else 'WITH SKILL'}")
    print(f"{'='*60}\n")

    all_grading_results = []

    for i, eval_item in enumerate(evals):
        eval_id = eval_item.get("id", i)
        prompt = eval_item["prompt"]
        assertions = eval_item.get("assertions", [])

        print(f"[{i+1}/{len(evals)}] Running eval {eval_id}: {prompt[:80]}...")

        # Executar
        eval_output_dir = os.path.join(args.output_dir, f"eval-{eval_id}")
        if args.baseline:
            result = run_eval_baseline(prompt, eval_output_dir)
        else:
            result = run_eval_with_skill(prompt, args.skill_path, eval_output_dir)

        if not result["success"]:
            print(f"  FAILED: {result['stderr'][:200]}")
            for a in assertions:
                all_grading_results.append({"name": a["name"], "passed": False, "evidence": "Eval execution failed"})
            continue

        # Grading
        if assertions:
            print(f"  Grading {len(assertions)} assertions...")
            grades = grade_assertions(assertions, eval_output_dir)
            all_grading_results.extend(grades)
            for g in grades:
                status = "PASS" if g["passed"] else "FAIL"
                print(f"    [{status}] {g['name']}: {g.get('evidence', '')[:80]}")
        else:
            print(f"  WARNING: No assertions defined for eval {eval_id}")

    # Calcular pass_rate
    pass_rate = calculate_pass_rate(all_grading_results)
    prev_rate = get_last_pass_rate(args.results_file, skill_name)
    commit = get_current_commit()

    # Decisao de ratcheting
    if pass_rate >= prev_rate:
        status = "keep"
        decision = "KEEP (improved or maintained)"
    else:
        status = "discard"
        decision = "DISCARD (regression)"

    # Registar
    append_results(args.results_file, commit, skill_name, pass_rate,
                   prev_rate, status, args.hypothesis)

    # Report
    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"  Skill:       {skill_name}")
    print(f"  Pass Rate:   {pass_rate:.1%} ({sum(1 for r in all_grading_results if r.get('passed'))}/{len(all_grading_results)})")
    print(f"  Previous:    {prev_rate:.1%}")
    print(f"  Delta:       {(pass_rate - prev_rate):+.1%}")
    print(f"  Decision:    {decision}")
    print(f"  Commit:      {commit}")
    print(f"{'='*60}\n")

    # Exit code: 0 = keep, 1 = discard
    sys.exit(0 if status == "keep" else 1)


if __name__ == "__main__":
    main()
