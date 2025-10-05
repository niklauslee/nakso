import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Shape } from "@dgmjs/core";

export interface EditingState {
  scale: number;
  origin: [number, number];
  selection: Shape[];
  activeHandler: string | null;
  activeHandlerLock: boolean;
  dragging: boolean;
  setScale: (scale: number) => void;
  setOrigin: (origin: [number, number]) => void;
  setSelection: (selections: Shape[]) => void;
  setActiveHandler: (handlerId: string | null) => void;
  setActiveHandlerLock: (lock: boolean) => void;
  setDragging: (dragging: boolean) => void;
}

export const useEditingStore = create<EditingState>()(
  devtools(
    (set) => ({
      scale: 1,
      origin: [0, 0],
      selection: [],
      activeHandler: null,
      activeHandlerLock: false,
      dragging: false,
      setScale: (scale) => set((state) => ({ scale })),
      setOrigin: (origin) => set((state) => ({ origin })),
      setSelection: (selections) => set((state) => ({ selection: selections })),
      setActiveHandler: (handlerId) =>
        set((state) => ({ activeHandler: handlerId })),
      setActiveHandlerLock: (lock) =>
        set((state) => ({ activeHandlerLock: lock })),
      setDragging: (dragging) => set((state) => ({ dragging })),
    }),
    { name: "EditingStore" }
  )
);
