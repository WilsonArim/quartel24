---
name: design-system
phase: 4
always_active: false
absorbs: frontend-design, tailwind-patterns, ui-ux-pro-max
description: "Complete visual system — design tokens, colors, typography, spacing, Tailwind v4, components, AI slop detection, and design baseline tracking"
keywords: [design, UI, layout, cores, tipografia, Tailwind, CSS, tokens, estilo, classe, spacing, acessibilidade]
---

# Design System

> Phase 4 — From visual principles to production-ready implementation. The single source of truth for design in SOTA MAX.

---

## 1. Visual Principles & Hierarchy

Visual hierarchy directs the user's eye through content in order of importance. Every screen should have exactly one primary focal point. If everything is emphasized, nothing is.

### Core Principles

1. **Size** — Larger elements draw attention first. Use clear size progression for headings, body, and captions.
2. **Weight** — Bold text commands more attention than regular weight at the same size.
3. **Color and Contrast** — High-contrast elements stand out. Use accent colors sparingly (≤5%) for calls to action.
4. **Spacing** — More whitespace around an element increases visual importance and separates content groups.
5. **Position** — In LTR languages, top-left is read first. Place primary actions in expected scan paths (F-pattern, Z-pattern).

### Color Distribution (Target Allocation)

- **Neutral tones** (grays, muted backgrounds): 60–70% of visible screen area
- **Primary color**: 10–15% of visible screen area (brand identity, primary CTAs, active states)
- **Secondary color**: Supporting actions, secondary navigation
- **Accent colors**: 5% or less, only where immediate attention is needed
- **Destructive colors**: Errors, delete actions, warnings

Always test colors against real content, not empty mockups.

---

## 2. Design Tokens — Authoritative Reference

Design tokens are the atomic values that define the visual language. They are organized in layers of abstraction.

### Token Layers

```
Primitive Tokens  →  Semantic Tokens  →  Component Tokens
(raw values)         (contextual meaning) (specific usage)

blue-500: #3b82f6    primary: blue-500      button-bg-primary: primary
gray-100: #f3f4f6    muted: gray-100        card-bg: muted
```

### Primitive Color Tokens

Never reference primitives directly in components. Use semantic tokens instead.

```css
/* Core palette */
--blue-50: #eff6ff;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-800: #1f2937;
--gray-900: #111827;
--red-500: #ef4444;
--red-600: #dc2626;
--green-500: #10b981;
--green-600: #059669;
```

### Semantic Tokens (Use These)

```css
/* Light mode (default) */
--color-primary: var(--blue-500);
--color-primary-hover: var(--blue-600);
--color-primary-foreground: #ffffff;

--color-secondary: var(--gray-600);

--color-destructive: var(--red-500);
--color-destructive-hover: var(--red-600);
--color-destructive-foreground: #ffffff;

--color-success: var(--green-500);
--color-success-hover: var(--green-600);

--color-background: var(--gray-50);
--color-surface: #ffffff;
--color-foreground: var(--gray-900);
--color-foreground-secondary: var(--gray-600);
--color-muted: var(--gray-100);
--color-muted-foreground: var(--gray-600);
--color-border: var(--gray-200);
--color-ring: var(--blue-500);

/* Dark mode (swap values) */
@media (prefers-color-scheme: dark) {
  --color-background: var(--gray-900);
  --color-surface: var(--gray-800);
  --color-foreground: var(--gray-50);
  --color-foreground-secondary: var(--gray-400);
  --color-muted: var(--gray-800);
  --color-muted-foreground: var(--gray-400);
  --color-border: var(--gray-700);
}

/* Class-based dark mode override (for manual toggle) */
.dark {
  --color-background: var(--gray-900);
  --color-surface: var(--gray-800);
  --color-foreground: var(--gray-50);
  --color-foreground-secondary: var(--gray-400);
  --color-muted: var(--gray-800);
  --color-muted-foreground: var(--gray-400);
  --color-border: var(--gray-700);
}
```

### Spacing Tokens (4px/8px Grid)

All spacing derives from a base-4 or base-8 scale, creating visual rhythm and consistency.

```css
--space-0: 0;
--space-px: 1px;
--space-0.5: 2px;
--space-1: 4px;      /* Tight inline spacing, icon gaps */
--space-2: 8px;      /* Default gap between related elements */
--space-3: 12px;     /* Input padding, small card padding */
--space-4: 16px;     /* Standard card padding, section gaps */
--space-5: 20px;     /* Medium section separation */
--space-6: 24px;     /* Large section padding */
--space-8: 32px;     /* Section dividers, layout gaps */
--space-10: 40px;    /* Major section separation */
--space-12: 48px;    /* Page-level vertical rhythm */
--space-16: 64px;    /* Hero spacing, large layout gaps */
```

**Spacing Rules:**
- Never use arbitrary pixel values. Always reference the spacing scale.
- Padding inside a container should be consistent on all sides (or symmetric horizontal/vertical).
- Use `gap` for spacing between sibling elements, not margins on individual items.

### Typography Tokens

```css
--font-sans: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;

/* Font sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */

/* Line heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Font weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Border Radius Tokens

```css
--radius-sm: 0.25rem;   /* 4px — small interactive elements */
--radius-md: 0.375rem;  /* 6px — inputs, buttons */
--radius-lg: 0.5rem;    /* 8px — cards, modals */
--radius-xl: 0.75rem;   /* 12px — large components */
```

### Shadow Tokens (Elevation System)

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Semantic elevation (prefer named elevations) */
--elevation-raised: var(--shadow-sm);   /* Cards, buttons */
--elevation-overlay: var(--shadow-md);  /* Dropdowns, popovers */
--elevation-modal: var(--shadow-xl);    /* Modals, dialogs */
```

---

## 3. Color System

### Functional Palette Structure

```
Primary      → Brand identity, primary CTAs, active states
Secondary    → Supporting actions, secondary navigation
Accent       → Highlights, badges, notifications
Destructive  → Errors, delete actions, warnings
Success      → Confirmations, positive feedback
Muted        → Backgrounds, disabled states, borders
Foreground   → Text colors (primary, secondary)
Background   → Surface colors (page, card, elevated)
```

### Color Usage Guidelines

- **Primary color** should appear on 10–15% of the visible screen area maximum.
- **Neutral tones** (grays, muted backgrounds) should dominate at 60–70%.
- **Accent and destructive colors** are used for 5% or less, only where they need immediate attention.
- Always define both light and dark variants for every semantic color.
- Never rely on color alone to convey information (add icons, text, or patterns).

### Dark Mode Implementation

Tailwind v4 supports dark mode via `prefers-color-scheme` by default. For manual toggle:

```css
@import "tailwindcss";

/* Enable class-based dark mode in v4 */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Light mode tokens defined here */
}

/* Override tokens for dark mode */
.dark {
  --color-background: var(--gray-900);
  --color-surface: var(--gray-800);
  --color-border: var(--gray-700);
  --color-foreground: var(--gray-50);
}
```

HTML usage:

```html
<!-- Automatic via prefers-color-scheme -->
<div class="bg-background text-foreground">
  This adapts to OS dark mode automatically.
</div>

<!-- Manual toggle with .dark class -->
<html class="dark">
  <!-- All colors automatically adapt -->
</html>
```

---

## 4. Typography System

Use a modular scale (ratio 1.25 or 1.333) for consistent type sizing.

### Type Scale

| Level    | Size   | Line Height | Weight   | Usage                     |
|----------|--------|-------------|----------|---------------------------|
| `xs`     | 12px   | 16px        | Regular  | Captions, helper text     |
| `sm`     | 14px   | 20px        | Regular  | Secondary text, labels    |
| `base`   | 16px   | 24px        | Regular  | Body text (default)       |
| `lg`     | 18px   | 28px        | Medium   | Lead paragraphs           |
| `xl`     | 20px   | 28px        | Semibold | Card titles, sub-headings |
| `2xl`    | 24px   | 32px        | Semibold | Section headings (h3)     |
| `3xl`    | 30px   | 36px        | Bold     | Page headings (h2)        |
| `4xl`    | 36px   | 40px        | Bold     | Hero headings (h1)        |

### Typography Rules

- **Limit to 2 font families maximum** (one for headings, one for body, or a single versatile family).
- **Body text line length** should be 45–75 characters for readability.
- **Paragraph spacing** should be 1.5x the line height of the text.
- Use `tracking-tight` (letter-spacing: -0.02em) on large headings for visual impact.
- Use `tracking-normal` (0) on body text for readability.

### Tailwind Typography Utilities

```html
<!-- Heading with proper tracking and weight -->
<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">

<!-- Body text with constrained width for readability -->
<p class="max-w-prose text-base leading-relaxed text-foreground-secondary">

<!-- Truncated text (single line) -->
<span class="truncate block max-w-xs">

<!-- Clamped text (multi-line, show ellipsis after 3 lines) -->
<p class="line-clamp-3">
```

---

## 5. Spacing System

### Spacing Grid

Use the 4px/8px grid consistently across all spacing. Never use arbitrary pixel values.

### Common Patterns

```html
<!-- Consistent vertical stack spacing -->
<div class="space-y-4">
  <!-- Children separated by 16px (space-4) -->
</div>

<!-- Card with balanced padding -->
<div class="p-4 sm:p-6">
  <!-- 16px on mobile, 24px on tablet+ -->
</div>

<!-- Inline items with gap -->
<div class="flex items-center gap-2">
  <!-- 8px between flex children -->
</div>

<!-- Responsive section padding -->
<section class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
```

### Responsive Spacing

Always use mobile-first breakpoints. Define mobile spacing first, then override at larger sizes:

```html
<!-- Responsive padding -->
<section class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

<!-- Responsive gap -->
<div class="grid gap-4 sm:gap-6 lg:gap-8">

<!-- Responsive section separation -->
<div class="mb-8 sm:mb-12 lg:mb-16">
```

---

## 6. Tailwind v4 Configuration & Implementation

### CSS-First Configuration

Tailwind v4 replaces `tailwind.config.js` with CSS directives in your global stylesheet.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-secondary: #6b7280;
  --color-destructive: #ef4444;
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  --color-border: #e5e5e5;
  --color-ring: #3b82f6;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Custom spacing beyond defaults */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #0a0a0a;
    --color-foreground: #fafafa;
    --color-muted: #262626;
  }
}
```

### Changes from v3 to v4

| Aspect              | v3                              | v4                              |
|---------------------|--------------------------------|---------------------------------|
| Configuration       | `tailwind.config.js`           | `@theme` in CSS                 |
| Import              | `@tailwind base/components/utilities` | `@import "tailwindcss"`    |
| Custom colors       | JS config `theme.extend.colors`| `--color-*` in `@theme`        |
| Plugins             | JS plugin API                  | CSS `@plugin` directive         |
| Container queries   | Plugin required                | Built-in `@container`           |
| CSS variables       | Manual setup                   | Native throughout               |
| Dark mode           | `darkMode: "class"`            | Automatic via `prefers-color-scheme` |

### Utility Patterns

#### Layout Utilities

```html
<!-- Centered page content with max width -->
<main class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

<!-- Full-height page with sticky footer -->
<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">

<!-- Responsive card grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

<!-- Sidebar layout -->
<div class="flex">
  <aside class="w-64 shrink-0 border-r">Sidebar</aside>
  <main class="flex-1 p-6">Content</main>
</div>

<!-- Flex: centered content (horizontal and vertical) -->
<div class="flex items-center justify-center min-h-screen" />

<!-- Flex: space between header items -->
<header class="flex items-center justify-between px-6 h-16" />

<!-- Flex: stack with consistent gap -->
<div class="flex flex-col gap-4" />

<!-- Flex: inline list that wraps -->
<div class="flex flex-wrap gap-2" />
```

#### Typography Utilities

```html
<!-- Heading with proper tracking and weight -->
<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">

<!-- Body text with constrained width -->
<p class="max-w-prose text-base leading-relaxed text-muted-foreground">

<!-- Truncated text (single line) -->
<span class="truncate block max-w-xs">

<!-- Clamped text (multi-line) -->
<p class="line-clamp-3">

<!-- Responsive text sizing -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl">

<!-- Responsive flex direction -->
<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
```

#### Spacing Utilities

```html
<!-- Consistent vertical stack spacing -->
<div class="space-y-4">

<!-- Card with balanced padding -->
<div class="p-4 sm:p-6">

<!-- Inline items with gap -->
<div class="flex items-center gap-2">

<!-- Responsive section padding -->
<section class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

<!-- Show/hide based on viewport -->
<nav class="hidden lg:flex">Desktop Nav</nav>
<button class="lg:hidden">Menu</button>
```

### Class Organization Convention

Order Tailwind classes consistently for readability. Follow this grouping:

```
1. Layout       → display, position, grid, flex, float
2. Box model    → width, height, margin, padding, border
3. Typography   → font, text, leading, tracking
4. Visual       → background, shadow, opacity, rounded
5. Interactivity→ cursor, pointer-events, select
6. Transitions  → transition, duration, ease
7. State        → hover:, focus:, active:, disabled:
8. Responsive   → sm:, md:, lg:, xl:
```

Example with organized classes:

```html
<button class="
  inline-flex items-center justify-center
  h-10 px-4 rounded-md border
  text-sm font-medium text-foreground
  bg-background shadow-sm
  cursor-pointer
  transition-colors duration-150
  hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50
">
  Button
</button>
```

**Tip:** Use `prettier-plugin-tailwindcss` to automatically sort classes:

```bash
npm install -D prettier-plugin-tailwindcss
```

### The `cn()` Helper Pattern

The `cn()` utility merges Tailwind classes intelligently, resolving conflicts:

```ts
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```tsx
// Merge base styles with conditional and override classes
<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/5",
  className // allow consumer overrides
)} />
```

**Why both `clsx` and `twMerge`?**
- `clsx` handles conditional class joining (booleans, arrays, objects).
- `twMerge` resolves Tailwind-specific conflicts (`p-2 p-4` → `p-4`).

---

## 7. Component Patterns

### Card

```html
<div class="rounded-lg border border-border bg-surface p-6 shadow-sm">
  <h3 class="text-lg font-semibold text-foreground">Card Title</h3>
  <p class="mt-2 text-sm text-muted-foreground">Card description text.</p>
  <div class="mt-4 flex gap-2">
    <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
      Action
    </button>
  </div>
</div>
```

### Button Variants

```html
<!-- Primary -->
<button class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
  Primary
</button>

<!-- Outline -->
<button class="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Outline
</button>

<!-- Ghost -->
<button class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  Ghost
</button>
```

### Form Input

```html
<div class="space-y-2">
  <label for="email" class="text-sm font-medium text-foreground">Email</label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
  />
  <p class="text-xs text-muted-foreground">We will never share your email.</p>
</div>
```

### Compound Component Pattern

Use compound components for complex UI elements that share implicit state.

```tsx
// Usage
<Select value={value} onValueChange={setValue}>
  <Select.Trigger>
    <Select.Value placeholder="Choose..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
    <Select.Item value="b">Option B</Select.Item>
  </Select.Content>
</Select>
```

### Variant Pattern with CVA

Use `class-variance-authority` to manage component variants systematically.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-background hover:bg-muted",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
```

---

## 8. Responsive Design & Accessibility

### Responsive Breakpoints

Adopt a mobile-first approach. Define breakpoints at content-driven thresholds:

| Name   | Min Width | Typical Devices             |
|--------|----------|-----------------------------|
| `sm`   | 640px    | Large phones (landscape)    |
| `md`   | 768px    | Tablets (portrait)          |
| `lg`   | 1024px   | Tablets (landscape), laptops|
| `xl`   | 1280px   | Desktops                    |
| `2xl`  | 1536px   | Large desktops              |

### Responsive Guidelines

- Design for mobile first, then progressively add layout complexity at wider breakpoints.
- Navigation should collapse into a hamburger/drawer below `lg`.
- Grid layouts should reduce columns: 4 cols at `xl`, 3 at `lg`, 2 at `md`, 1 at `sm`.
- Touch targets must be at least 44x44px on mobile.
- Test at real device widths, not just browser resize.

### Accessibility (WCAG 2.1 AA)

#### Contrast Ratios

| Content Type             | Minimum Ratio | Recommended |
|--------------------------|---------------|-------------|
| Normal text (< 18px)     | 4.5:1         | 7:1         |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 | 4.5:1    |
| UI components and icons  | 3:1           | 4.5:1       |
| Decorative elements      | No requirement| —           |

Tools to verify contrast: WebAIM Contrast Checker, Chrome DevTools Accessibility pane, Figma plugins (Stark, A11y).

#### Focus Management

- Every interactive element must have a visible focus indicator.
- Focus indicator should have at least 3:1 contrast against the surrounding background.
- Use `focus-visible` (not `focus`) to show focus rings only for keyboard navigation.
- Implement logical tab order that follows visual reading order.
- When opening modals, move focus to the modal. On close, return focus to the triggering element.
- Skip-to-content links should be the first focusable element on every page.

#### Essential Accessibility Checklist

1. All images have descriptive `alt` text (or `alt=""` if purely decorative).
2. Form inputs have associated `<label>` elements (not just placeholder text).
3. Error messages are announced to screen readers via `aria-live="assertive"` or `role="alert"`.
4. Color is never the sole means of conveying information (add icons, text, or patterns).
5. Page has a single `<h1>`, and heading levels are sequential (no skipping from h1 to h3).
6. Interactive elements are reachable and operable with keyboard alone.
7. Motion and animation respect `prefers-reduced-motion`.
8. Touch targets are at minimum 44x44 CSS pixels with adequate spacing.

### Micro-Interactions

Micro-interactions provide feedback and make the interface feel responsive. Keep them subtle and purposeful.

```css
/* Button press feedback */
.button:active {
  transform: scale(0.97);
}

/* Smooth state transitions */
.interactive {
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

/* Entrance animation for new content */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeInUp 200ms ease-out; }

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

**Rules for micro-interactions:**
- Duration should be 100–300ms. Anything longer feels sluggish.
- Use `ease-out` for entrances, `ease-in` for exits.
- Always respect `prefers-reduced-motion` by disabling or simplifying animations.
- Never animate layout properties (width, height, top, left) — use transform and opacity.

### Layout Patterns

#### Grid Patterns

```tsx
// Standard content grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => <Card key={item.id} {...item} />)}
</div>

// Sidebar layout
<div className="grid grid-cols-[280px_1fr] gap-0">
  <aside className="border-r h-screen sticky top-0">Sidebar</aside>
  <main className="p-8">Content</main>
</div>

// Holy grail layout (sticky footer)
<div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</div>
```

#### Flexbox Patterns

```tsx
// Space between header items
<header className="flex items-center justify-between px-6 h-16" />

// Stack with consistent gap
<div className="flex flex-col gap-4" />

// Inline list that wraps
<div className="flex flex-wrap gap-2" />
```

### Loading Patterns

#### Skeleton Loading

```tsx
function PostCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-3 w-full rounded bg-muted animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
    </div>
  );
}
```

Skeleton loaders should mirror the exact shape and layout of the content they replace. This prevents layout shift when real content loads.

#### Shimmer Effect

```css
.shimmer {
  background: linear-gradient(90deg, var(--muted) 25%, var(--muted-light) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty States

Every list, table, and data view must have a designed empty state. An empty state includes:

1. **Illustration or icon** — a visual cue that the area is intentionally empty.
2. **Headline** — what the user is looking at ("No projects yet").
3. **Description** — brief explanation or guidance ("Create your first project to get started").
4. **Action** — a primary button to resolve the empty state ("Create Project").

```tsx
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

### Error States

#### Error State Hierarchy

1. **Field-level errors** — inline, directly below the input, red text with icon.
2. **Form-level errors** — banner at top of form summarizing issues.
3. **Section-level errors** — error boundary replacing the failed section with retry option.
4. **Page-level errors** — full-page error with navigation back to safety.

#### Error State Component Pattern

```tsx
function SectionError({ title, message, onRetry }: SectionErrorProps) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
      <h3 className="font-semibold text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 text-sm font-medium text-primary hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
```

**Rules:**
- Error messages should be human-readable, never raw error codes.
- Always provide a recovery path (retry, go back, contact support).
- Log the technical error details to your monitoring system, not to the user.

---

## 9. AI Slop Detection

AI-generated design has recognizable patterns that feel generic, unmotivated, and lack intentionality. This section helps you identify and eliminate AI slop.

### AI Slop Blacklist

**Pattern:** 3-column icon grid with headings
- Ubiquitous in AI-generated landing pages
- **Fix:** Use asymmetric layouts, vary column counts, or replace with contextual imagery

**Pattern:** Purple gradient backgrounds + rounded blob decorations
- Default Tailwind palette, zero brand personality
- **Fix:** Use constrained, intentional color systems; remove decorative blobs entirely

**Pattern:** Centered hero section with 3 rows of text + CTA button
- Ultra-generic structure, lacks visual variation
- **Fix:** Asymmetric layouts, integrate visuals, break the grid

**Pattern:** Uniform bubbly borders (rounded-2xl on everything)
- Looks cute but signals "template"
- **Fix:** Use mixed border radii: sharp (0), small (4px), medium (8px), rarely large (12px+)

**Pattern:** Decorative emoji as design elements
- Cheap, low-effort way to "design"
- **Fix:** Use proper illustrations, icons, or whitespace

**Pattern:** Generic hero copy ("Revolutionize your workflow," "Empower your team")
- Meaningless corporate jargon
- **Fix:** Specific, benefit-driven copy with real value propositions

**Pattern:** Cookie-cutter section rhythm (image left, text right, repeat)
- Boring, predictable, uninspired
- **Fix:** Vary layouts, use full-width sections, break patterns intentionally

**Pattern:** Identical card designs repeated endlessly
- No visual hierarchy, no focal points
- **Fix:** Vary card sizes, use featured cards, reduce card count

**Pattern:** Neon accent colors on pastel backgrounds
- Harsh, eye-straining, looks cheap
- **Fix:** Use semantic color systems with intentional contrast

**Pattern:** Auto-generated testimonials with stock photos
- Fake authenticity signal
- **Fix:** Use real testimonials with real names, no photos if not genuine

---

### AI Slop Scoring System

Rate designs on an A–F scale for AI slop detection:

**A (Zero Slop):** Original, intentional design decisions. Clear brand voice. Unique layout. Semantic color system. Purposeful whitespace.

**B (Minimal Slop):** Mostly original but one or two generic patterns. Overall strong brand. Minor compromises.

**C (Moderate Slop):** Multiple generic patterns visible. Generic color palette. Predictable layouts. Still functional, but uninspired.

**D (Heavy Slop):** Dominated by AI-generated patterns. Generic hero, icon grids, blob decorations. Lacks intentionality. Feels like a template.

**F (Pure Slop):** Indistinguishable from AI tools. Every anti-pattern present. No original design decisions. Feels cost-cut.

### Slop Detection Checklist

When reviewing a design, ask:

- [ ] Does this hero have a unique, intentional layout? Or is it the generic centered 3-column?
- [ ] Are the colors semantically meaningful to the brand? Or just the default purple gradient?
- [ ] Do the section rhythms vary, or do they repeat the same left-right pattern?
- [ ] Are borders and corner radii intentional? Or uniformly bubbly?
- [ ] Are decorative elements (blobs, emoji, icons) adding value? Or just filling space?
- [ ] Is the copy specific and benefit-driven? Or generic corporate jargon?
- [ ] Does the layout break the grid intentionally? Or follow a predictable grid slavishly?
- [ ] Are cards varied in size/importance? Or identical and repetitive?
- [ ] Is the color palette intentional and constrained? Or garish neon on pastels?
- [ ] Does the design feel like it was designed for THIS product? Or a generic template?

**Score:** Count the "no"s and "or generic..." answers. 7+ means you have F-tier slop.

---

## 10. Design Baseline Tracking

To prevent design regression and catch visual bugs, maintain a `design-baseline.json` file that documents reference screenshots and design specs.

### Baseline File Structure

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-26T10:30:00Z",
  "components": {
    "Button": {
      "variants": {
        "primary-md": {
          "baselineImage": "/design-baselines/button-primary-md.png",
          "description": "Primary button, medium size",
          "screenshots": {
            "light": { "url": "...", "viewport": "1024px" },
            "dark": { "url": "...", "viewport": "1024px" },
            "mobile": { "url": "...", "viewport": "375px" }
          },
          "tokens": {
            "bg": "var(--color-primary)",
            "text": "var(--color-primary-foreground)",
            "padding": "var(--space-4) 1rem",
            "borderRadius": "var(--radius-md)",
            "height": "2.5rem"
          },
          "states": {
            "hover": { "baselineImage": "/design-baselines/button-primary-md-hover.png" },
            "focus": { "baselineImage": "/design-baselines/button-primary-md-focus.png" },
            "disabled": { "baselineImage": "/design-baselines/button-primary-md-disabled.png" }
          }
        }
      }
    },
    "Card": {
      "baselineImage": "/design-baselines/card.png",
      "description": "Standard card component",
      "tokens": {
        "bg": "var(--color-surface)",
        "border": "1px solid var(--color-border)",
        "borderRadius": "var(--radius-lg)",
        "padding": "var(--space-6)",
        "shadow": "var(--shadow-sm)"
      }
    }
  },
  "layouts": {
    "HolyGrailLayout": {
      "baselineImage": "/design-baselines/layout-holy-grail.png",
      "description": "Header + Content + Footer",
      "viewports": {
        "desktop": { "width": 1440, "baselineImage": "..." },
        "tablet": { "width": 768, "baselineImage": "..." },
        "mobile": { "width": 375, "baselineImage": "..." }
      }
    }
  },
  "tokens": {
    "colors": {
      "primary": "#3b82f6",
      "primary-hover": "#2563eb"
    },
    "spacing": {
      "space-4": "1rem",
      "space-6": "1.5rem"
    },
    "typography": {
      "text-base": { "size": "1rem", "lineHeight": 1.5 }
    }
  }
}
```

### Visual Regression Testing Workflow

1. **Establish baseline:** After finalizing a component design, capture reference screenshots at all viewport sizes and interaction states.
2. **Store baseline images:** Save to `/public/design-baselines/` with clear naming (e.g., `button-primary-md.png`, `button-primary-md-hover.png`).
3. **Document tokens:** Record the design tokens (colors, spacing, typography) used in each component.
4. **Run visual diff on CI:** Use tools like Playwright with visual comparison to detect pixel-level changes.
5. **Review regressions:** If changes are intentional, update the baseline. If accidental, fix the code.

### Integration with Testing

```ts
// Example: Playwright visual regression test
import { test, expect } from "@playwright/test";

test("Button primary variant should not visually regress", async ({ page }) => {
  await page.goto("/components/button");
  const button = page.locator("button.primary-md");

  // Compare against baseline screenshot
  await expect(button).toHaveScreenshot("button-primary-md.png");

  // Compare hover state
  await button.hover();
  await expect(button).toHaveScreenshot("button-primary-md-hover.png");
});
```

### Baseline Update Frequency

- **Minor visual tweaks:** Update baseline only if approved by design lead
- **Brand refresh:** Batch update all baselines
- **Component redesign:** Create new baseline with versioning (e.g., `v2-button-primary-md.png`)
- **New viewport added:** Capture baseline at new breakpoint

### Tools

- **Playwright** — Visual regression testing with `toHaveScreenshot()`
- **Percy.io** — Cloud-based visual diff service
- **Chromatic** — Storybook visual testing
- **Pixelmatch** — Programmatic pixel-level comparison

---

## 11. Design Review Checklist

Before shipping any UI, verify the following:

- [ ] Visual hierarchy is clear — one primary action per view
- [ ] Spacing follows the 4px/8px grid consistently
- [ ] Typography uses the defined scale, no arbitrary sizes
- [ ] Color contrast passes WCAG AA for all text and interactive elements
- [ ] Responsive layout tested at all defined breakpoints (sm, md, lg, xl, 2xl)
- [ ] Focus states are visible and logical
- [ ] Loading, empty, and error states are designed
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Dark mode tested and verified
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] AI slop score is A or B (zero to minimal slop)
- [ ] Baseline screenshots captured for new components
- [ ] Semantic tokens used (no hardcoded colors or spacing)
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Skip-to-content link is first focusable element
- [ ] No color used as sole means of information

---

## Summary

This consolidated design system provides the complete toolkit for Phase 4 — from visual principles through production implementation. Use it as the authoritative reference for:

- Design tokens and semantic values
- Typography and spacing systems
- Tailwind v4 configuration and patterns
- Component structure and patterns
- Responsive design and accessibility
- AI slop detection and prevention
- Design baseline tracking and visual regression

Always consult this guide before designing or implementing new UI. When in doubt, default to semantic tokens, accessibility standards, and intentional design decisions over generic patterns.
