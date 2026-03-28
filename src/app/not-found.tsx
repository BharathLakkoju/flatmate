"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Home, ArrowLeft, Search, Map } from "lucide-react";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const digitVariant: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -30 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingCompass() {
  return (
    <motion.div
      animate={{
        rotate: [0, 15, -10, 20, 0],
        y: [0, -6, 0, -4, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      className="inline-flex items-center justify-center h-16 w-16 rounded-[18px] bg-primary/10 border border-primary/20"
    >
      <Map className="h-8 w-8 text-primary" strokeWidth={1.5} />
    </motion.div>
  );
}

const suggestions = [
  {
    icon: <Home className="h-4 w-4 text-primary" />,
    label: "Go home",
    sub: "Back to your dashboard",
    href: "/app",
  },
  {
    icon: <Search className="h-4 w-4 text-secondary" />,
    label: "Expenses",
    sub: "Track shared spending",
    href: "/app/expenses",
  },
  {
    icon: <ArrowLeft className="h-4 w-4 text-on-surface-variant" />,
    label: "Go back",
    sub: "Return to the previous page",
    href: "javascript:history.back()",
  },
];

function SuggestionsSection() {
  return (
    <section className="px-6 py-20 bg-surface-container-low">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-lg mx-auto space-y-8"
      >
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Find your way
          </p>
          <h2 className="font-heading text-2xl font-bold text-on-surface">
            Here&apos;s where you can go
          </h2>
        </motion.div>

        <motion.div variants={stagger} className="flex flex-col gap-3">
          {suggestions.map((s, i) => (
            <motion.div key={i} variants={digitVariant}>
              <Link
                href={s.href}
                className="flex items-center gap-4 rounded-[16px] bg-surface-container-lowest border border-surface-container p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="h-9 w-9 rounded-[10px] bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary/8 transition-colors">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {s.label}
                  </p>
                  <p className="text-xs text-on-surface-variant">{s.sub}</p>
                </div>
                <motion.div
                  className="ml-auto text-on-surface-variant/40"
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                >
                  →
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="px-6 py-24 text-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-sm mx-auto space-y-4"
      >
        <motion.p
          variants={fadeUp}
          className="text-sm text-on-surface-variant leading-relaxed"
        >
          If you ended up here from a link inside the app, please let someone
          know — it&apos;s probably a bug we&apos;d like to fix.
        </motion.p>
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 text-xs text-on-surface-variant/60">
            <span className="h-px w-6 bg-outline-variant" />
            <span>flatmate · shared living, tracked simply</span>
            <span className="h-px w-6 bg-outline-variant" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-10 relative">
        {/* Background dots */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(81,101,72,0.05) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          {/* Floating compass */}
          <motion.div variants={fadeUp}>
            <FloatingCompass />
          </motion.div>

          {/* 404 digits — each animates independently */}
          <motion.div
            variants={stagger}
            className="flex items-center gap-2 sm:gap-4"
            style={{ perspective: 800 }}
          >
            {["4", "0", "4"].map((digit, i) => (
              <motion.span
                key={i}
                variants={digitVariant}
                className="font-heading font-black text-[clamp(5rem,20vw,9rem)] leading-none tracking-tighter"
                style={{
                  color:
                    digit === "0" ? "#516548" : i === 0 ? "#30332e" : "#6b6e68",
                }}
              >
                {digit}
              </motion.span>
            ))}
          </motion.div>

          {/* Label */}
          <motion.div variants={fadeUp} className="space-y-3 max-w-md">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface">
              This room doesn&apos;t exist
            </h1>
            <p className="text-on-surface-variant leading-relaxed">
              Looks like you&apos;ve wandered into a part of the flat that
              hasn&apos;t been built yet — or maybe never will be.
            </p>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUp}>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4" />
              Take me home
            </Link>
          </motion.div>
        </motion.div>

        {/* Subtle scroll indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-[10px] uppercase tracking-widest text-on-surface-variant/40"
        >
          Scroll for options
        </motion.p>
      </section>

      {/* ── Suggestions ── */}
      <SuggestionsSection />

      {/* ── Closing note ── */}
      <ClosingSection />
    </div>
  );
}
