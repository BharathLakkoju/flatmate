"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Receipt,
  UtensilsCrossed,
  Users,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

const features = [
  {
    icon: Calendar,
    title: "Calendar-First View",
    description:
      "A familiar monthly grid where each day holds your meals and expenses. No learning curve — you already know how to use it.",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description:
      "Log shared expenses in under 30 seconds. Category tags, payer tracking, and daily totals at a glance.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Planning",
    description:
      "Plan breakfast, lunch, and dinner for the week. See what's cooking today without a group chat.",
  },
  {
    icon: Users,
    title: "Shared Access",
    description:
      "One invite code, everyone's in. No accounts to manage — just simple shared living.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Flat",
    description:
      "Sign up and create your household in seconds. Give it a name that feels like home.",
  },
  {
    number: "02",
    title: "Share the Code",
    description:
      "Get a unique invite code. Share it with your flatmates — that's all they need to join.",
  },
  {
    number: "03",
    title: "Track Together",
    description:
      "Log expenses, plan meals, manage tasks. Everything in one place, visible to everyone.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-[20px]"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-on-surface">
            Flatmate
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="cursor-pointer">
              <Button
                variant="ghost"
                className="text-on-surface-variant hover:text-on-surface"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup" className="cursor-pointer">
              <Button className="bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary-fixed/30 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-on-surface-variant text-sm uppercase tracking-[0.2em] mb-4 font-medium"
            >
              Shared Living, Tracked Simply
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-on-surface leading-tight mb-6"
            >
              Your flat.
              <br />
              <span className="text-primary">One shared record.</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-on-surface-variant text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Track expenses, plan meals, and manage shared tasks — all from a
              calendar you already know how to use. No spreadsheets, no
              splitting apps, no complexity.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] px-8 h-12 text-base"
                >
                  Create Your Flat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/join">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[12px] px-8 h-12 text-base bg-surface-container-lowest text-on-surface"
                >
                  I Have an Invite Code
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-6 w-6 text-on-surface-variant/50" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm uppercase tracking-[0.2em] font-medium mb-3">
              Features
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-4">
              Everything your flat needs
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
              Purpose-built for flatmates. No bloat, no learning curve.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                className="group bg-surface-container-lowest rounded-[12px] p-6 hover:shadow-[0_12px_32px_rgba(48,51,46,0.06)] transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-[12px] bg-primary-fixed/40 flex items-center justify-center mb-4 group-hover:bg-primary-fixed/60 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-surface-container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm uppercase tracking-[0.2em] font-medium mb-3">
              How It Works
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface">
              Up and running in minutes
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-outline-variant/30 hidden sm:block" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="space-y-12"
            >
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  variants={slideFromLeft}
                  transition={{ duration: 0.6 }}
                  className="flex gap-6 items-start"
                >
                  <div className="relative z-10 shrink-0 w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary-dim flex items-center justify-center">
                    <span className="font-heading text-lg font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading text-xl font-semibold text-on-surface mb-2">
                      {step.title}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Case / Social Proof Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={slideFromLeft}
              transition={{ duration: 0.7 }}
            >
              <p className="text-primary text-sm uppercase tracking-[0.2em] font-medium mb-3">
                Built for Real Life
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-6">
                Three flatmates. One shared record.
                <br />
                Zero confusion.
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                No more &ldquo;how much did we spend this month?&rdquo; messages
                in the group chat. No more spreadsheets that nobody updates.
                Just a simple calendar where everything lives.
              </p>
              <div className="space-y-4">
                {[
                  "Log an expense in under 30 seconds",
                  "See weekly meal plans at a glance",
                  "Track who paid what — no awkward settling",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-on-surface">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-surface-container-lowest rounded-[16px] p-8 shadow-[0_12px_32px_rgba(48,51,46,0.06)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                      March 2026
                    </span>
                    <span className="text-xs bg-primary-fixed/50 text-primary px-3 py-1 rounded-full font-medium">
                      This Month
                    </span>
                  </div>
                  <div className="font-heading text-4xl font-bold text-on-surface">
                    ₹12,450
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    Total household spend
                  </p>
                  <div className="h-px bg-surface-container-high my-2" />
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Bharath", amount: "₹4,500", pct: "36%" },
                      { name: "Sai", amount: "₹4,000", pct: "32%" },
                      { name: "Ravi", amount: "₹3,950", pct: "32%" },
                    ].map((person) => (
                      <div key={person.name} className="text-center">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed mx-auto mb-2 flex items-center justify-center">
                          <span className="font-medium text-primary text-sm">
                            {person.name[0]}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface">
                          {person.amount}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {person.pct} share
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Harmony Meter */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Balance Status</span>
                      <span className="text-primary font-medium">
                        Balanced
                      </span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-secondary to-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "88%" }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.2,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 bg-surface-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-4">
            Ready to simplify your shared living?
          </h2>
          <p className="text-on-surface-variant text-lg mb-8 max-w-xl mx-auto">
            Join flatmates across the world who have already ditched the
            spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] px-8 h-12 text-base"
              >
                Create Your Flat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/join">
              <Button
                variant="outline"
                size="lg"
                className="rounded-[12px] px-8 h-12 text-base bg-surface-container-lowest text-on-surface"
              >
                Join with Invite Code
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-semibold text-on-surface">
            Flatmate
          </span>
          <p className="text-xs text-on-surface-variant">
            Built for shared living. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
