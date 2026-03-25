"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  Copy,
  Check,
  RefreshCw,
  Moon,
  Sun,
  Bell,
  Shield,
  LogOut,
  UserMinus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFlatStore } from "@/stores/use-flat-store";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SettingsPage() {
  const flat = useFlatStore((s) => s.flat);
  const members = useFlatStore((s) => s.members);
  const currentMember = useFlatStore((s) => s.currentMember);
  const removeMember = useFlatStore((s) => s.removeMember);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const isAdmin = currentMember?.role === "admin";

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    setRemoveError("");

    try {
      const res = await fetch(`/api/members/${memberToRemove.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
      removeMember(memberToRemove.id);
      setMemberToRemove(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRemoving(false);
    }
  };

  const inviteCode = flat?.invite_code || "—";
  const flatName = flat?.name || "My Flat";

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
  };

  const displayMembers = members;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Settings
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Household profile & preferences
        </p>
      </motion.div>

      {/* Household Profile */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-primary-fixed flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-on-surface">
              Household Profile
            </p>
            <p className="text-xs text-on-surface-variant">
              Manage your flat details
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Flat Name
            </Label>
            <Input
              defaultValue={flatName}
              className="rounded-[12px] bg-surface-container-high h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Invite Code
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-container-high rounded-[12px] h-10 px-3 flex items-center font-mono text-sm text-on-surface tracking-wider">
                {inviteCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="h-10 w-10 rounded-[12px] bg-primary-fixed flex items-center justify-center text-primary hover:opacity-80 transition-opacity"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button className="h-10 w-10 rounded-[12px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Share this code to invite new flatmates
            </p>
          </div>
        </div>
      </motion.div>

      {/* Members */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-secondary-container flex items-center justify-center">
            <Users className="h-5 w-5 text-on-secondary-container" />
          </div>
          <div>
            <p className="font-heading font-semibold text-on-surface">Members</p>
            <p className="text-xs text-on-surface-variant">
              {displayMembers.length} flatmate{displayMembers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {displayMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-surface-container rounded-[12px] p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary-fixed text-primary text-sm font-bold">
                    {member.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    {member.display_name}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    {member.role}
                  </p>
                </div>
              </div>
              {isAdmin && member.id !== currentMember?.id && (
                <button
                  onClick={() => setMemberToRemove({ id: member.id, name: member.display_name })}
                  className="h-8 w-8 rounded-[8px] flex items-center justify-center text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove member"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <p className="font-heading font-semibold text-on-surface">Preferences</p>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-4 w-4 text-on-surface-variant" />
              ) : (
                <Sun className="h-4 w-4 text-on-surface-variant" />
              )}
              <div>
                <p className="text-sm text-on-surface">Dark Mode</p>
                <p className="text-xs text-on-surface-variant">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <Separator className="bg-surface-container" />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-sm text-on-surface">Notifications</p>
                <p className="text-xs text-on-surface-variant">
                  Receive reminders for tasks and expenses
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <Separator className="bg-surface-container" />

          {/* Monthly Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-on-surface-variant" />
              <Label className="text-sm text-on-surface">Monthly Budget Cap</Label>
            </div>
            <div className="flex items-center gap-2 ml-7">
              <span className="text-on-surface-variant text-sm">₹</span>
              <Input
                type="number"
                defaultValue="15000"
                className="rounded-[12px] bg-surface-container-high h-10 w-32"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div variants={fadeUp}>
        <button className="w-full flex items-center justify-center gap-2 rounded-[12px] h-11 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-sm font-medium">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </motion.div>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="bg-surface-container-lowest rounded-[16px] max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              Remove Member
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-on-surface">{memberToRemove?.name}</span>{" "}
              from this flat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {removeError && (
            <p className="text-sm text-destructive bg-tertiary-container/50 p-3 rounded-[8px]">
              {removeError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={removing}
              className="flex-1 rounded-[12px] h-11 bg-surface-container-high text-on-surface"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveMember}
              disabled={removing}
              className="flex-1 rounded-[12px] h-11 bg-destructive text-slate-50"
            >
              {removing ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
