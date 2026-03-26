"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, Users, ArrowRight, Plus, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

type Step = "welcome" | "choice" | "create" | "join" | "budget" | "done";

const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [flatName, setFlatName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [resultCode, setResultCode] = useState("");
  const [resultFlatName, setResultFlatName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("15000");
  const [flatId, setFlatId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If the user already belongs to a flat (e.g. logging in on a new device),
  // restore their flat_id and skip onboarding entirely.
  useEffect(() => {
    const existing = localStorage.getItem("flatmate_flat_id");
    if (existing) {
      router.replace("/app/home");
      return;
    }
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.flat?.id) {
          localStorage.setItem("flatmate_flat_id", data.flat.id);
          router.replace("/app/home");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleCreateFlat = async () => {
    if (!flatName.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: flatName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create flat");
      }

      const flat = await res.json();
      setResultCode(flat.invite_code);
      setResultFlatName(flat.name);
      setFlatId(flat.id);

      // Store flat ID
      localStorage.setItem("flatmate_flat_id", flat.id);

      setStep("budget");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFlat = async () => {
    if (!inviteCode.trim()) return;
    setError("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch("/api/flats/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: inviteCode.trim().toUpperCase(),
          display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Member",
          user_id: user?.id || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid invite code");
      }

      const { flat } = await res.json();
      localStorage.setItem("flatmate_flat_id", flat.id);
      setResultFlatName(flat.name);
      // Do NOT set resultCode — joiners don't need to share the invite code
      setFlatId(flat.id);
      // Skip budget step — only the flat creator (admin) sets the budget
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step: Welcome */}
          {step === "welcome" && (
            <motion.div key="welcome" {...fadeSlide} className="text-center space-y-8">
              <div className="space-y-3">
                <div className="mx-auto h-16 w-16 rounded-[16px] bg-primary-fixed flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-heading text-3xl font-bold text-on-surface">
                  Welcome to Flatmate
                </h1>
                <p className="text-on-surface-variant">
                  Let&apos;s set up your shared household in under a minute.
                </p>
              </div>
              <Button
                onClick={() => setStep("choice")}
                className="w-full bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-12 text-base"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step: Choice */}
          {step === "choice" && (
            <motion.div key="choice" {...fadeSlide} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  How do you want to start?
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Create a new household or join an existing one.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep("create")}
                  className="w-full bg-surface-container-lowest rounded-[12px] p-5 text-left flex items-center gap-4 hover:bg-surface-container-low transition-colors shadow-[0_4px_16px_rgba(48,51,46,0.04)]"
                >
                  <div className="h-12 w-12 rounded-[12px] bg-primary-fixed flex items-center justify-center shrink-0">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-on-surface">
                      Create a Flat
                    </p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      Start fresh — invite your flatmates later
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setStep("join")}
                  className="w-full bg-surface-container-lowest rounded-[12px] p-5 text-left flex items-center gap-4 hover:bg-surface-container-low transition-colors shadow-[0_4px_16px_rgba(48,51,46,0.04)]"
                >
                  <div className="h-12 w-12 rounded-[12px] bg-tertiary-container flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-on-surface" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-on-surface">
                      Join a Flat
                    </p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      Use an invite code from your flatmate
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Create */}
          {step === "create" && (
            <motion.div key="create" {...fadeSlide} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-[12px] bg-primary-fixed flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  Name your flat
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Something your flatmates will recognise.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-[16px] p-6 space-y-5 shadow-[0_12px_32px_rgba(48,51,46,0.06)]">
                <div className="space-y-2">
                  <Label htmlFor="flatName" className="text-on-surface text-sm font-medium">
                    Flat Name
                  </Label>
                  <Input
                    id="flatName"
                    value={flatName}
                    onChange={(e) => setFlatName(e.target.value)}
                    placeholder="e.g. Kondapur 2BHK"
                    className="bg-surface-container-high rounded-[12px] h-11 focus:bg-surface-container-lowest transition-colors"
                    maxLength={100}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-tertiary-container/50 p-3 rounded-[8px]">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("choice"); setError(""); }}
                    className="flex-1 rounded-[12px] h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateFlat}
                    disabled={loading || !flatName.trim()}
                    className="flex-1 bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-11"
                  >
                    {loading ? "Creating..." : "Create Flat"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Join */}
          {step === "join" && (
            <motion.div key="join" {...fadeSlide} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-[12px] bg-tertiary-container flex items-center justify-center">
                  <Users className="h-6 w-6 text-on-surface" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  Join your flat
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Enter the invite code your flatmate shared.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-[16px] p-6 space-y-5 shadow-[0_12px_32px_rgba(48,51,46,0.06)]">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode" className="text-on-surface text-sm font-medium">
                    Invite Code
                  </Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. KON-4821"
                    className="bg-surface-container-high rounded-[12px] h-11 focus:bg-surface-container-lowest transition-colors text-center font-mono text-lg tracking-wider uppercase"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-tertiary-container/50 p-3 rounded-[8px]">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("choice"); setError(""); }}
                    className="flex-1 rounded-[12px] h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinFlat}
                    disabled={loading || !inviteCode.trim()}
                    className="flex-1 bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-11"
                  >
                    {loading ? "Joining..." : "Join Flat"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Budget */}
          {step === "budget" && (
            <motion.div key="budget" {...fadeSlide} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-[12px] bg-primary-fixed flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  Set monthly budget
                </h2>
                <p className="text-on-surface-variant text-sm">
                  How much does your household spend per month? You can change this anytime.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-[16px] p-6 space-y-5 shadow-[0_12px_32px_rgba(48,51,46,0.06)]">
                <div className="space-y-2">
                  <Label htmlFor="monthlyBudget" className="text-on-surface text-sm font-medium">
                    Monthly Budget (₹)
                  </Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="bg-surface-container-high rounded-[12px] h-11 focus:bg-surface-container-lowest transition-colors text-lg"
                    min={0}
                  />
                  <p className="text-[10px] text-on-surface-variant">
                    This helps track spending against your household budget
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-tertiary-container/50 p-3 rounded-[8px]">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("done");
                    }}
                    className="flex-1 rounded-[12px] h-11"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={async () => {
                      const budget = parseInt(monthlyBudget, 10);
                      if (isNaN(budget) || budget < 0) {
                        setError("Please enter a valid budget amount");
                        return;
                      }
                      setError("");
                      setLoading(true);
                      try {
                        const res = await fetch("/api/flats", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ flat_id: flatId, monthly_budget: budget }),
                        });
                        if (!res.ok) {
                          // Non-critical — proceed anyway
                        }
                      } catch {
                        // Non-critical
                      } finally {
                        setLoading(false);
                        setStep("done");
                      }
                    }}
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-11"
                  >
                    {loading ? "Saving..." : "Set Budget"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <motion.div key="done" {...fadeSlide} className="text-center space-y-6">
              <div className="space-y-3">
                <div className="mx-auto h-16 w-16 rounded-[16px] bg-primary-fixed flex items-center justify-center">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  {resultCode ? "You're all set!" : "Welcome to your flat!"}
                </h2>
                <p className="text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{resultFlatName}</span> is ready to go.
                </p>

                {/* Only show invite code to the flat creator (admin) */}
                {resultCode && (
                  <div className="mt-4 bg-surface-container-lowest rounded-[12px] p-4 inline-block shadow-[0_4px_16px_rgba(48,51,46,0.04)]">
                    <p className="text-xs text-on-surface-variant mb-1">
                      Share this invite code with flatmates
                    </p>
                    <p className="font-mono text-xl font-bold text-primary tracking-wider">
                      {resultCode}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push("/app/home")}
                className="w-full bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-12 text-base"
              >
                Enter Your Flat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
