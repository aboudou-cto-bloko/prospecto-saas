@AGENTS.md

# Prospecto SaaS — Mini CRM WhatsApp

## Stack
- Next.js 16 + TypeScript (--webpack pour compatibilité better-auth)
- Prisma 7 + Prisma Postgres (via Prisma Console)
- Better Auth (email/password + magic link + organization plugin)
- Tailwind CSS 4 + shadcn/ui (New York)
- Moneroo pour les paiements
- WhatsApp via liens wa.me/ (pas de Baileys)
- Vercel pour le déploiement

## Architecture
- Multi-tenant par **Organization** (Better Auth organization plugin)
- Toutes les données CRM scopées par `organizationId`
- Subscription liée à l'org (remplace l'ancien système de license JWT)
- Plans : free → freelance → pro → enterprise

## Conventions
- Commits en français
- Pas de `any` — toujours `unknown` + type guards
- Zod pour la validation aux frontières
- Variables d'environnement pour tous les secrets

## Design System
- Style inspiré de Linear : dark mode, accent lavande (#5e6ad2)
- Police : Inter (display) + JetBrains Mono (code)
- Surface ladder : canvas → surface-1 → surface-2 → surface-3
- Pas de mode clair, pas de gradients atmosphériques
