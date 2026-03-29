-- Função: alertas de membros que atingiram 18 anos mas ainda têm plano de criança
CREATE OR REPLACE FUNCTION get_age_transition_alerts()
RETURNS TABLE (
  member_id        uuid,
  first_name       text,
  last_name        text,
  date_of_birth    date,
  age_years        integer,
  turns_18_this_month boolean,
  plan_name        text,
  subscription_id  uuid,
  subscription_end_date date
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id                                                          AS member_id,
    m.first_name,
    m.last_name,
    m.date_of_birth::date,
    EXTRACT(year FROM AGE(CURRENT_DATE, m.date_of_birth::date))::integer
                                                                  AS age_years,
    (
      EXTRACT(year  FROM (m.date_of_birth::date + INTERVAL '18 years'))
        = EXTRACT(year  FROM CURRENT_DATE)
      AND
      EXTRACT(month FROM (m.date_of_birth::date + INTERVAL '18 years'))
        = EXTRACT(month FROM CURRENT_DATE)
    )                                                             AS turns_18_this_month,
    p.name                                                        AS plan_name,
    s.id                                                          AS subscription_id,
    s.end_date::date                                              AS subscription_end_date
  FROM members m
  JOIN subscriptions s
    ON s.member_id = m.id
   AND s.status    = 'active'
  JOIN subscription_plans p
    ON p.id             = s.plan_id
   AND p.age_category   = 'criança'
  WHERE
    m.date_of_birth IS NOT NULL
    AND m.is_active = true
    AND (
      -- Já tem 18 ou mais anos e ainda em plano criança
      EXTRACT(year FROM AGE(CURRENT_DATE, m.date_of_birth::date)) >= 18
      OR
      -- Vai/acaba de fazer 18 anos este mês
      (
        EXTRACT(year  FROM (m.date_of_birth::date + INTERVAL '18 years'))
          = EXTRACT(year  FROM CURRENT_DATE)
        AND
        EXTRACT(month FROM (m.date_of_birth::date + INTERVAL '18 years'))
          = EXTRACT(month FROM CURRENT_DATE)
      )
    )
  ORDER BY
    -- Primeiro os que já passaram (mais urgente), depois os que fazem este mês
    turns_18_this_month ASC,
    m.date_of_birth ASC;
$$;
