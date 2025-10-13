import { create } from "zustand";

export interface KeymapState {
  formattedKeys: Record<string, string>;
  setFormattedKeys: (formattedKeys: Record<string, string>) => void;
}

export const useKeymapStore = create<KeymapState>()((set) => ({
  formattedKeys: {},
  setFormattedKeys: (formattedKeys) => set({ formattedKeys }),
}));
