"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Zap, Shield, Sparkles, ArrowDown, Home } from "lucide-react";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingHouse() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
    >
      {/* Glow ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-32 w-32 rounded-full bg-primary/20"
      />
      {/* Icon container */}
      <div className="relative h-24 w-24 rounded-[28px] bg-primary flex items-center justify-center shadow-lg">
        <Home className="h-12 w-12 text-primary-foreground" strokeWidth={1.5} />
      </div>
    </motion.div>
  );
}

function PulsingBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="h-2 w-2 rounded-full bg-primary block"
      />
      <span className="text-xs font-medium text-primary tracking-wide">
        Maintenance in progress
      </span>
    </div>
  );
}

function ScrollCue() {
  return (
    <motion.div
      animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center gap-1 text-on-surface-variant"
    >
      <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      <ArrowDown className="h-4 w-4" />
    </motion.div>
  );
}

const updates = [
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Performance upgrades",
    body: "Faster load times, reduced bundle size, and smoother transitions across the entire app.",
  },
  {
    icon: <Shield className="h-5 w-5 text-secondary" />,
    title: "Security patches",
    body: "Dependency updates and hardened API routes to keep your household data safe.",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-tertiary" />,
    title: "New features",
    body: "Fresh improvements to expenses, meals, and the grocery tracker based on your feedback.",
  },
];

function UpdatesSection() {
  return (
    <section className="px-6 py-24 max-w-3xl mx-auto">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-12"
      >
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            What's changing
          </p>
          <h2 className="font-heading text-3xl font-bold text-on-surface">
            We&apos;re making things better
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
            This downtime lets us ship meaningful improvements without rolling
            restarts or partial deploys.
          </p>
        </motion.div>

        <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-3">
          {updates.map((u, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className="rounded-[20px] bg-surface-container-lowest border border-surface-container p-5 space-y-3 shadow-sm"
            >
              <div className="h-10 w-10 rounded-[12px] bg-surface-container flex items-center justify-center">
                {u.icon}
              </div>
              <h3 className="font-heading font-semibold text-on-surface text-sm">
                {u.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {u.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProgressSection() {
  return (
    <section className="px-6 py-24 bg-surface-container-low">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-xl mx-auto space-y-8 text-center"
      >
        <motion.div variants={fadeUp} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Status
          </p>
          <h2 className="font-heading text-3xl font-bold text-on-surface">
            Almost there
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Our deploy pipeline is running. The app will be live again as soon
            as all health checks pass.
          </p>
        </motion.div>

        {/* Animated deploy pipeline */}
        <motion.div variants={fadeUp} className="space-y-3">
          {[
            { label: "Build", done: true },
            { label: "Tests", done: true },
            { label: "Deploy", done: false },
            { label: "Health checks", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
                className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-primary"
                    : "border-2 border-outline-variant bg-surface-container"
                }`}
              >
                {step.done && (
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.3 }}
                    viewBox="0 0 12 12"
                    className="h-3 w-3"
                  >
                    <motion.path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </motion.svg>
                )}
                {!step.done && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="h-2 w-2 rounded-full bg-outline-variant"
                  />
                )}
              </motion.div>
              <div className="flex-1 h-px bg-surface-container-high relative overflow-hidden rounded-full">
                {step.done && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.15 + 0.1,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                )}
                {!step.done && (
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    className="absolute inset-0 w-1/3 bg-primary/30 rounded-full"
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium w-24 text-left ${
                  step.done ? "text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function ParallaxText({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const words = [
    "Upgrading",
    "·",
    "Deploying",
    "·",
    "Improving",
    "·",
    "Optimising",
    "·",
    "Launching",
    "·",
  ];

  return (
    <div className="overflow-hidden py-6 border-y border-surface-container select-none">
      <motion.div style={{ x }} className="flex gap-8 whitespace-nowrap">
        {[...words, ...words].map((w, i) => (
          <span
            key={i}
            className={`text-lg font-heading font-bold ${
              w === "·" ? "text-primary" : "text-on-surface-variant/40"
            }`}
          >
            {w}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ClosingSection() {
  return (
    <section className="px-6 py-28 max-w-xl mx-auto text-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-6"
      >
        <motion.p
          variants={fadeUp}
          className="text-xs uppercase tracking-widest text-primary font-medium"
        >
          Thank you
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-heading text-4xl font-bold text-on-surface leading-tight"
        >
          See you on the
          <br />
          other side
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-on-surface-variant text-sm leading-relaxed"
        >
          Flatmate will be back shortly. Your data is safe and all your
          household records are intact.
        </motion.p>
        <motion.div variants={fadeUp} className="pt-4">
          <div className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="h-px w-8 bg-outline-variant" />
            <span>flatmate · shared living, tracked simply</span>
            <span className="h-px w-8 bg-outline-variant" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-surface overflow-x-hidden"
    >
      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8 relative">
        {/* Background grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(81,101,72,0.06) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          <motion.div variants={fadeUp}>
            <FloatingHouse />
          </motion.div>

          <motion.div variants={fadeUp}>
            <PulsingBadge />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3 max-w-lg">
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-on-surface leading-tight tracking-tight">
              We&apos;re fixing
              <br />
              things up
            </h1>
            <p className="text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              Flatmate is down for a scheduled deployment. We&apos;ll be back up
              before you need to split the next bill.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll cue at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8"
        >
          <ScrollCue />
        </motion.div>
      </section>

      {/* ── Parallax ticker ── */}
      <ParallaxText containerRef={containerRef} />

      {/* ── What's changing ── */}
      <UpdatesSection />

      {/* ── Deploy progress ── */}
      <ProgressSection />

      {/* ── Closing ── */}
      <ClosingSection />
    </div>
  );
}
