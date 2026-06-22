-- ============================================================================
-- Prospecto SaaS — RLS Policies
-- ============================================================================
-- À exécuter après chaque `prisma migrate dev` (Prisma ne gère pas les RLS).
--
-- Stratégie :
--   1. ENABLE + FORCE ROW LEVEL SECURITY sur toutes les tables
--   2. DENY ALL pour anon/authenticated (aucune policy = deny)
--   3. Policy explicite pour le rôle postgres (Prisma via pooler)
-- ============================================================================

-- ── ENABLE + FORCE ──────────────────────────────────────────────────────────

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
           AND tablename NOT LIKE '_prisma%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ── Policy pour Prisma (rôle postgres) ──────────────────────────────────────

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
           AND tablename NOT LIKE '_prisma%'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = t AND policyname = 'service_role_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY service_role_all ON %I FOR ALL TO postgres USING (true) WITH CHECK (true)', t
      );
    END IF;
  END LOOP;
END $$;
