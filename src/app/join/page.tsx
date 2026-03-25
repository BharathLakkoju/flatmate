"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

export default function JoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Look up flat by invite code
    const { data: flat, error: lookupError } = await supabase
      .from("flats")
      .select("id, name, invite_code")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .single();

    if (lookupError || !flat) {
      setError("Invalid invite code. Please check and try again.");
      setLoading(false);
      return;
    }

    // Store flat info and navigate
    localStorage.setItem("flatmate_flat_id", flat.id);
    localStorage.setItem("flatmate_invite_code", flat.invite_code);
    router.push("/app/home");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-2xl font-bold text-on-surface">
            Flatmate
          </Link>
          <p className="text-on-surface-variant mt-2">Join an existing household</p>
        </div>

        <div className="bg-surface-container-lowest rounded-[16px] p-8 shadow-[0_12px_32px_rgba(48,51,46,0.06)]">
          <form onSubmit={handleJoin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-on-surface text-sm font-medium">
                Invite Code
              </Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. COTTAGE-882"
                required
                className="bg-surface-container-high rounded-[12px] h-11 focus:bg-surface-container-lowest transition-colors text-center font-mono text-lg tracking-wider uppercase"
              />
              <p className="text-xs text-on-surface-variant text-center">
                Ask your flatmate for the household invite code
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-tertiary-container/50 p-3 rounded-[8px]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-11"
            >
              {loading ? "Joining..." : "Join Household"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-on-surface-variant">
              Want to create a new flat?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-on-surface-variant">
              Already a member?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
