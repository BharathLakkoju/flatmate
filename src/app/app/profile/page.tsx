"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, LogOut, ArrowLeft, Save } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useAppStore } from "@/stores/use-app-store";
import { ProfilePageSkeleton } from "@/components/shared/Skeletons";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProfilePage() {
  const isAppReady = useAppStore((s) => s.isAppReady);
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || "");
        const name =
          data.user.user_metadata?.display_name ||
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "";
        setDisplayName(name);
        setOriginalName(name);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    setSaving(false);
    if (!error) {
      setOriginalName(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const nameChanged = displayName !== originalName;

  if (!isAppReady) return <ProfilePageSkeleton />;

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-lg mx-auto space-y-8"
    >
      {/* Back link */}
      <motion.div variants={fadeUp}>
        <Link
          href="/app/home"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        variants={fadeUp}
        className="bg-surface-container-lowest rounded-[12px] p-6 flex flex-col items-center text-center space-y-4"
      >
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary-fixed text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading text-xl font-bold text-on-surface">
            {displayName || "User"}
          </p>
          <p className="text-sm text-on-surface-variant">{email}</p>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div
        variants={fadeUp}
        className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4"
      >
        <p className="font-heading font-semibold text-on-surface">
          Account Details
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium flex items-center gap-1.5">
              <User className="h-3 w-3" /> Display Name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-[12px] bg-surface-container-high h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> Email
            </Label>
            <Input
              value={email}
              readOnly
              className="rounded-[12px] bg-surface-container-high h-10 opacity-60"
            />
          </div>
        </div>

        {nameChanged && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-[12px] h-11 bg-linear-to-r from-primary to-primary-dim text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        )}
      </motion.div>

      <Separator className="bg-surface-container" />

      {/* Sign Out */}
      <motion.div variants={fadeUp}>
        <Button
          onClick={handleLogout}
          disabled={loading}
          className="w-full rounded-[12px] h-11 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          variant="ghost"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
