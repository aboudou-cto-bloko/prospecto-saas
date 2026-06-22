-- ============================================================================
-- Prospecto SaaS — RLS Policies
-- ============================================================================
-- Prisma utilise le rôle `postgres` (service_role) qui bypass les RLS.
-- Ces policies protègent contre les accès directs via l'API REST Supabase
-- (PostgREST) ou le client Supabase côté navigateur.
--
-- Stratégie : DENY ALL par défaut, seul le service_role (Prisma) peut écrire.
-- Les tables Better Auth sont protégées — aucun accès client direct.
-- ============================================================================

-- ── Better Auth tables — DENY ALL ──────────────────────────────────────────
-- Ces tables ne doivent JAMAIS être accessibles via l'API REST.
-- Better Auth les gère exclusivement via Prisma (service_role).

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- Aucune policy = deny all pour anon et authenticated

-- ── Organization tables — DENY ALL ─────────────────────────────────────────

ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitation" ENABLE ROW LEVEL SECURITY;

-- ── Subscription — DENY ALL ────────────────────────────────────────────────

ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;

-- ── CRM tables — DENY ALL ──────────────────────────────────────────────────
-- Toutes les opérations CRM passent par les Server Actions (Prisma).
-- Aucun accès client direct n'est nécessaire.

ALTER TABLE "prospect" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaign_prospect" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_field" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tag" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Vérification : aucune policy créée = toutes les tables sont en DENY ALL
-- pour les rôles anon et authenticated.
-- Le rôle postgres (service_role) bypass les RLS automatiquement.
-- ============================================================================

-- Pour vérifier que les RLS sont bien actives :
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
