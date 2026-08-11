import { create } from "zustand";

type LockStore = {
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
};

export const useLockStore = create<LockStore>((set) => ({
  isLocked: false,
  setLocked: (locked: boolean) => set({ isLocked: locked }),
}));
