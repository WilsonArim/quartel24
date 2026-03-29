-- ============================================
-- QUARTEL.24 — Database Schema v2
-- Modalidades: Ginásio, BJJ, MMA
-- Planos: Individuais + Packs, Criança + Adulto
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SUBSCRIPTION PLANS
-- Suporta planos individuais e packs (combinados)
-- Suporta categorias de idade (criança, adulto, todos)
-- ============================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  modalities TEXT[] NOT NULL DEFAULT '{}',
  -- Valores possíveis no array: 'ginasio', 'bjj', 'mma'
  -- Individual: {'ginasio'} ou {'bjj'} ou {'mma'}
  -- Pack: {'ginasio','bjj'} ou {'ginasio','bjj','mma'} etc.
  age_category TEXT NOT NULL DEFAULT 'adulto' CHECK (age_category IN ('adulto', 'criança', 'todos')),
  plan_type TEXT NOT NULL DEFAULT 'individual' CHECK (plan_type IN ('individual', 'pack')),
  duration_months INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. MEMBERS
-- Ficha de registo de nível elite
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ficha de inscrição
  member_number INTEGER,
  enrollment_date DATE,
  has_insurance BOOLEAN NOT NULL DEFAULT false,

  -- Dados Básicos
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F')),

  -- Morada
  address TEXT,
  city TEXT,
  postal_code TEXT,

  -- Documentos
  nif TEXT,
  cc_number TEXT,

  -- Saúde
  medical_conditions TEXT,
  allergies TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- Responsável (menores de idade)
  guardian_name TEXT,
  guardian_address TEXT,
  guardian_city TEXT,
  guardian_postal_code TEXT,
  guardian_cc TEXT,
  guardian_nif TEXT,
  guardian_date_of_birth DATE,
  guardian_phone TEXT,
  guardian_email TEXT,

  -- Foto
  photo_url TEXT,

  -- Meta
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. SUBSCRIPTIONS
-- Uma subscrição por membro ativo (pode ter histórico)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. PAYMENTS
-- Registo manual de pagamentos
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'multibanco', 'transferencia', 'mbway', 'outro')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_members_name ON members(first_name, last_name);
CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_members_nif ON members(nif);
CREATE INDEX idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_plans_modalities ON subscription_plans USING GIN(modalities);
CREATE INDEX idx_plans_age_category ON subscription_plans(age_category);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_members_updated
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_subscriptions_updated
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_plans_updated
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-EXPIRE SUBSCRIPTIONS (RPC)
-- Chamar periodicamente ou no carregamento do dashboard
-- ============================================
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DASHBOARD STATS (RPC)
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Primeiro, expirar subscrições vencidas
  PERFORM expire_subscriptions();

  SELECT json_build_object(
    'total_members', (SELECT COUNT(*) FROM members WHERE is_active = true),
    'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
    'expiring_soon', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
    'expired', (SELECT COUNT(*) FROM subscriptions WHERE status = 'expired'),
    'revenue_this_month', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_date >= date_trunc('month', CURRENT_DATE)),
    'payments_today', (SELECT COUNT(*) FROM payments WHERE payment_date = CURRENT_DATE)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GET EXPIRING SUBSCRIPTIONS (RPC)
-- Subscrições que expiram nos próximos 7 dias
-- ============================================
CREATE OR REPLACE FUNCTION get_expiring_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  member_id UUID,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  plan_name TEXT,
  modalities TEXT[],
  end_date DATE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    m.id AS member_id,
    m.first_name,
    m.last_name,
    m.phone,
    sp.name AS plan_name,
    sp.modalities,
    s.end_date,
    (s.end_date - CURRENT_DATE)::INTEGER AS days_remaining
  FROM subscriptions s
  JOIN members m ON m.id = s.member_id
  JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE s.status = 'active'
    AND s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  ORDER BY s.end_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA — Planos iniciais do Quartel.24
-- ============================================

-- Planos Individuais Adulto
INSERT INTO subscription_plans (name, description, modalities, age_category, plan_type, duration_months, price) VALUES
  ('Ginásio Mensal', 'Acesso mensal à sala de musculação e cardio', '{ginasio}', 'adulto', 'individual', 1, 35.00),
  ('BJJ Mensal', 'Acesso mensal às aulas de Brazilian Jiu-Jitsu', '{bjj}', 'adulto', 'individual', 1, 45.00),
  ('MMA Mensal', 'Acesso mensal às aulas de MMA', '{mma}', 'adulto', 'individual', 1, 45.00);

-- Packs Adulto
INSERT INTO subscription_plans (name, description, modalities, age_category, plan_type, duration_months, price) VALUES
  ('Ginásio + BJJ Mensal', 'Acesso mensal ao ginásio e aulas de BJJ', '{ginasio,bjj}', 'adulto', 'pack', 1, 65.00),
  ('Ginásio + MMA Mensal', 'Acesso mensal ao ginásio e aulas de MMA', '{ginasio,mma}', 'adulto', 'pack', 1, 65.00),
  ('Completo Mensal', 'Acesso total: Ginásio + BJJ + MMA', '{ginasio,bjj,mma}', 'adulto', 'pack', 1, 80.00);

-- Planos Individuais Criança
INSERT INTO subscription_plans (name, description, modalities, age_category, plan_type, duration_months, price) VALUES
  ('BJJ Criança Mensal', 'Aulas de BJJ para crianças', '{bjj}', 'criança', 'individual', 1, 30.00),
  ('MMA Criança Mensal', 'Aulas de MMA para crianças', '{mma}', 'criança', 'individual', 1, 30.00);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Authenticated users (gestora) pode fazer tudo
CREATE POLICY "Authenticated full access" ON members
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON subscriptions
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON payments
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON subscription_plans
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Planos são públicos para leitura (caso futuro)
CREATE POLICY "Public read plans" ON subscription_plans
  FOR SELECT USING (true);
