"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrambleText } from "@/components/landing/scramble-text";
import ScrollAnimations from "@/components/landing/scroll-animations";
import { PLANS, type PlanId } from "@/lib/plans";
import { Check, Star, ChevronDown, MessageSquare } from "lucide-react";

const BRAND = "#5e6ad2";

const problems = [
  {
    title: "2 heures pour 40 numéros",
    desc: "Tu parcours GoAfricaOnline page par page. Tu copies chaque numéro dans Excel. Tu perds la moitié avant d'avoir envoyé le premier message.",
  },
  {
    title: "WhatsApp sans mémoire",
    desc: "Tu recontactes quelqu'un qui t'a déjà dit non. Tu ne sais plus qui relancer, qui attendre. Tout est dans ta tête — et tu oublies.",
  },
  {
    title: "Tu envoies. Tu ne sais pas ce qui se passe.",
    desc: "Combien ont lu ? Combien ont répondu ? Tu fais la même chose le mois suivant sans savoir si ça marche.",
  },
];

const features = [
  {
    tag: "Trouver",
    title: "Prospects GoAfrica en 1 clic",
    desc: "Le scraper intégré extrait automatiquement les coordonnées des annuaires GoAfrica Online — nom, téléphone, secteur, ville — et les importe directement dans votre pipeline.",
    bullets: ["Filtrage par catégorie et ville", "Import direct dans les prospects", "Déduplication automatique"],
    screenshot: "/screenshots/scraper.png",
  },
  {
    tag: "Organiser",
    title: "Votre pipeline en un coup d'œil",
    desc: "5 statuts — Nouveau, Contacté, Qualifié, Converti, Perdu. Chaque prospect a son historique, ses tags et ses données personnalisées.",
    bullets: ["Filtres par statut, tag, source", "Champs personnalisés par prospect", "Import CSV en un clic"],
    screenshot: "/screenshots/prospects.png",
  },
  {
    tag: "Envoyer",
    title: "Campagnes WhatsApp personnalisées",
    desc: "Rédigez un template avec des variables dynamiques — {{nom}}, {{telephone}}. Prospecto génère un lien WhatsApp pré-rempli pour chaque prospect.",
    bullets: ["Variables dynamiques illimitées", "Lien wa.me/ par prospect", "Suivi envoyé / non envoyé"],
    screenshot: "/screenshots/campaigns.png",
  },
];

const steps = [
  { num: "01", title: "Créez votre compte", desc: "Inscription gratuite en 30 secondes. Aucune carte requise." },
  { num: "02", title: "Importez vos prospects", desc: "Via le scraper GoAfrica ou un fichier CSV." },
  { num: "03", title: "Lancez votre campagne", desc: "Créez un template, générez les liens WhatsApp, envoyez." },
];

const faqs = [
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Toutes les données sont chiffrées, stockées sur des serveurs européens, et isolées par organisation. Chaque équipe ne voit que ses propres prospects.",
  },
  {
    q: "Comment fonctionne le scraping ?",
    a: "Le scraper extrait les données publiques de GoAfricaOnline (nom, téléphone, secteur). Chaque entreprise extraite consomme 1 crédit. Vous pouvez acheter des packs supplémentaires si vous dépassez votre quota.",
  },
  {
    q: "Puis-je collaborer avec mon équipe ?",
    a: "Oui. Les plans Pro et Business incluent plusieurs membres. Chaque membre partage les prospects et campagnes de l'organisation. Les rôles (owner, admin, member) contrôlent les permissions.",
  },
  {
    q: "Comment fonctionne l'envoi WhatsApp ?",
    a: "Prospecto génère un lien wa.me/ pré-rempli pour chaque prospect. Un clic ouvre WhatsApp avec le message personnalisé prêt à envoyer. Simple, fiable, sans risque de ban.",
  },
  {
    q: "Que se passe-t-il si j'atteins mes limites ?",
    a: "L'application vous prévient. Les nouvelles créations sont bloquées mais vos données existantes restent intactes. Passez au plan supérieur ou achetez des crédits supplémentaires.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "MTN MoMo, Wave, Orange Money et carte bancaire via Moneroo. Paiement 100% sécurisé, adapté au marché africain.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#010102] text-white">
      <ScrollAnimations />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#010102]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-[15px] font-semibold">◆ Prospecto</Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-[#8a8f98] transition-colors hover:text-white">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-[#8a8f98] transition-colors hover:text-white">Tarifs</a>
            <a href="#faq" className="text-sm text-[#8a8f98] transition-colors hover:text-white">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-[#8a8f98] transition-colors hover:text-white">
              Connexion
            </Link>
            <Link href="/register" className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: BRAND }}>
          GoAfricaOnline · WhatsApp · Bénin & Afrique francophone
        </p>
        <h1 className="mb-6 max-w-3xl text-6xl font-bold leading-[1.02] md:text-7xl" style={{ letterSpacing: "-0.04em" }}>
          <ScrambleText text="Tu prospectes" delay={0} duration={700} /><br />
          <ScrambleText text="à la main." delay={220} duration={700} /><br />
          <span style={{ color: BRAND }}>
            <ScrambleText text="Arrête." delay={440} duration={550} />
          </span>
        </h1>
        <p className="mb-3 max-w-lg text-base leading-[1.75] text-[#8a8f98]">
          Prospecto collecte tes leads sur GoAfricaOnline, les organise dans un CRM
          et génère tes messages WhatsApp personnalisés automatiquement.
        </p>
        <p className="mb-10 text-sm" style={{ color: `${BRAND}cc` }}>
          À partir de 5 000 FCFA / mois — moins que le coût d'un client perdu.
        </p>
        <div className="mb-14 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
            Essayer gratuitement
          </Link>
          <a href="#pricing" className="flex items-center gap-1.5 border border-white/10 px-5 py-2.5 text-sm font-medium text-[#8a8f98] transition-colors hover:bg-white/[0.04]">
            Voir les tarifs <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-hidden border border-white/[0.06] bg-[#0a0a09]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
            <span className="ml-2 font-mono text-xs text-[#8a8f98]">prospecto.aboudouzinsou.site/dashboard</span>
          </div>
          <Image src="/screenshots/02-dashboard.png" alt="Dashboard Prospecto" width={1440} height={900} className="block w-full" priority />
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-16">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: BRAND }}>Le problème</p>
          <h2 className="max-w-lg text-4xl font-bold leading-tight md:text-5xl" style={{ letterSpacing: "-0.03em" }}>
            Tu prospectes.<br />Mais pas vraiment.
          </h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {problems.map((item, i) => (
            <div key={item.title} className="grid grid-cols-[3rem_1fr] gap-8 py-10 fade-up">
              <span className="select-none pt-0.5 font-bold tabular-nums leading-none" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.05)", letterSpacing: "-0.03em" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mb-2.5 font-semibold text-[#f7f8f8]">{item.title}</h3>
                <p className="text-sm leading-[1.75] text-[#8a8f98]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-b border-white/[0.06] bg-[#010102] px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-28">
          {features.map((f, i) => (
            <div key={f.tag} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className={`flex flex-col gap-5 fade-up ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <span className="inline-flex w-fit rounded-full border border-white/[0.06] bg-[#191918] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#8a8f98]">
                  {f.tag}
                </span>
                <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>{f.title}</h2>
                <p className="text-[15px] leading-[1.65] text-[#8a8f98]">{f.desc}</p>
                <ul className="flex flex-col gap-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#8a8f98]">
                      <Check className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a09] fade-up ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <Image src={f.screenshot} alt={f.title} width={1440} height={900} className="w-full object-cover object-top" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="border-b border-white/[0.06] bg-[#111110] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center fade-up">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: BRAND }}>Démarrage</p>
            <h2 className="text-3xl font-bold md:text-4xl" style={{ letterSpacing: "-0.02em" }}>Opérationnel en 2 minutes</h2>
          </div>
          <div className="mx-auto mb-20 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.num} className={`flex flex-col items-center gap-4 text-center fade-up`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border" style={{ background: i === 2 ? BRAND : "#010102", borderColor: i === 2 ? BRAND : "rgba(255,255,255,0.06)", color: i === 2 ? "#fff" : BRAND }}>
                  <span className="text-lg font-bold">{s.num}</span>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium text-white">{s.title}</h3>
                  <p className="text-[15px] leading-[1.65] text-[#8a8f98]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="border-b border-white/[0.06] bg-[#010102] px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center fade-up">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: BRAND }}>Tarifs</p>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl" style={{ letterSpacing: "-0.02em" }}>
              Simple. Transparent. Pas de surprise.
            </h2>
            <p className="text-[15px] text-[#8a8f98]">
              Paiement via MTN MoMo, Wave ou Orange Money. Pas de frais cachés.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).map(([id, plan]) => (
              <div
                key={id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 fade-up ${plan.popular ? "border-[#5e6ad2]" : "border-white/[0.06] bg-[#111110]"}`}
                style={plan.popular ? { boxShadow: `0 0 40px ${BRAND}15, 0 0 0 1px ${BRAND}` } : undefined}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold text-white" style={{ background: BRAND }}>
                    <Star className="h-3 w-3" /> POPULAIRE
                  </div>
                )}
                <p className="mb-1 text-sm font-medium text-[#8a8f98]">{plan.name}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-white">
                    {plan.price === 0 ? "Sur devis" : `${plan.price.toLocaleString("fr-FR")} F`}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-[#8a8f98]"> / mois</span>}
                </div>
                <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                  {[
                    `${isFinite(plan.limits.scrapingCredits) ? plan.limits.scrapingCredits.toLocaleString("fr-FR") : "Illimité"} crédits scraping`,
                    `${isFinite(plan.limits.prospects) ? plan.limits.prospects.toLocaleString("fr-FR") : "Illimité"} prospects`,
                    `${isFinite(plan.limits.campaigns) ? plan.limits.campaigns : "Illimité"} campagne${plan.limits.campaigns > 1 ? "s" : ""}`,
                    `${isFinite(plan.limits.members) ? plan.limits.members : "Illimité"} membre${plan.limits.members > 1 ? "s" : ""}`,
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#8a8f98]">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                {id === "enterprise" ? (
                  <a
                    href={`https://wa.me/2290167266360?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur le plan Enterprise de Prospecto.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90" style={{ background: BRAND, color: "#fff" }}
                  >
                    <MessageSquare className="h-4 w-4" /> Nous contacter
                  </a>
                ) : (
                  <Link href="/register" className="w-full rounded-lg px-4 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: plan.popular ? BRAND : "transparent", border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                    Commencer
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-b border-white/[0.06] bg-[#111110] px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl fade-up" style={{ letterSpacing: "-0.02em" }}>
            Questions fréquentes
          </h2>
          <div className="border-t border-white/[0.06] fade-up">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border-b border-white/[0.06]">
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-lg font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#8a8f98] transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: openFaq === i ? "200px" : "0px" }}>
                  <p className="pb-5 text-[15px] leading-[1.65] text-[#8a8f98]">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center fade-up">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
            Prêt à prospecter intelligemment ?
          </h2>
          <p className="mb-10 max-w-md text-[15px] text-[#8a8f98]">
            Créez votre compte gratuitement. Aucune carte bancaire requise. Essai 14 jours.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center rounded-md px-8 py-4 text-base font-medium text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] bg-[#0a0a09] py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <span className="text-[15px] font-semibold">◆ Prospecto</span>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#features" className="text-sm text-[#8a8f98] transition-colors hover:text-white">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-[#8a8f98] transition-colors hover:text-white">Tarifs</a>
            <a href="#faq" className="text-sm text-[#8a8f98] transition-colors hover:text-white">FAQ</a>
          </div>
          <p className="text-center text-xs text-[#8a8f98] md:text-right">
            © 2026 Prospecto · Fait par{" "}
            <a href="https://aboudouzinsou.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-white">
              aboudouzinsou.com
            </a>
          </p>
        </div>
      </footer>

      {/* Scroll animation styles */}
      <style jsx global>{`
        .fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}
