import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Doc, Shape } from "@dgmjs/core";

export interface EditorState {
  filePath: string | null;
  doc: Doc | null;
  readonly: boolean;
  modified: boolean;
  scale: number;
  origin: [number, number];
  selection: Shape[];
  activeHandler: string | null;
  activeHandlerLock: boolean;
  dragging: boolean;
  setFilePath: (filePath: string | null, doc: Doc, readonly: boolean) => void;
  setModified: (modified: boolean) => void;
  setScale: (scale: number) => void;
  setOrigin: (origin: [number, number]) => void;
  setSelection: (selections: Shape[]) => void;
  setActiveHandler: (handlerId: string | null) => void;
  setActiveHandlerLock: (lock: boolean) => void;
  setDragging: (dragging: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      filePath: null,
      doc: null as Doc | null,
      readonly: false,
      modified: false,
      scale: 1,
      origin: [0, 0],
      selection: [],
      activeHandler: null,
      activeHandlerLock: false,
      dragging: false,
      setFilePath: (filePath, doc, readonly) =>
        set({ filePath, doc, readonly }),
      setModified: (modified) => set({ modified }),
      setScale: (scale) => set({ scale }),
      setOrigin: (origin) => set({ origin }),
      setSelection: (selections) => set({ selection: selections }),
      setActiveHandler: (handlerId) => set({ activeHandler: handlerId }),
      setActiveHandlerLock: (lock) => set({ activeHandlerLock: lock }),
      setDragging: (dragging) => set({ dragging }),
    }),
    {
      name: "editor-store",
      partialize: (state) => ({}),
    }
  )
);
