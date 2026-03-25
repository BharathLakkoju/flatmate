import { create } from "zustand";
import type { Flat, Member } from "@/types";

interface FlatState {
  flat: Flat | null;
  members: Member[];
  currentMember: Member | null;
  setFlat: (flat: Flat | null) => void;
  setMembers: (members: Member[]) => void;
  setCurrentMember: (member: Member | null) => void;
  removeMember: (id: string) => void;
}

export const useFlatStore = create<FlatState>((set) => ({
  flat: null,
  members: [],
  currentMember: null,
  setFlat: (flat) => set({ flat }),
  setMembers: (members) => set({ members }),
  setCurrentMember: (currentMember) => set({ currentMember }),
  removeMember: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}));
