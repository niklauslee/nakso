import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface KeymapState {
  formattedKeys: Record<string, string>;
  setFormattedKeys: (formattedKeys: Record<string, string>) => void;
}

export const useKeymapStore = create<KeymapState>()(
  devtools(
    (set) => ({
      formattedKeys: {},
      setFormattedKeys: (formattedKeys) => set((state) => ({ formattedKeys })),
    }),
    { name: "KeymapStore" }
  )
);
