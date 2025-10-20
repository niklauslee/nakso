import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Doc, Shape } from "@dgmjs/core";
import { FileEntry } from "@/api/workspace";

export interface EditorState {
  workingFile: FileEntry | null;
  doc: Doc | null;
  modified: boolean;
  scale: number;
  origin: [number, number];
  selection: Shape[];
  activeHandler: string | null;
  activeHandlerLock: boolean;
  dragging: boolean;
  setWorkingFile: (file: FileEntry, doc: Doc) => void;
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
      workingFile: null,
      doc: null as Doc | null,
      modified: false,
      scale: 1,
      origin: [0, 0],
      selection: [],
      activeHandler: null,
      activeHandlerLock: false,
      dragging: false,
      setWorkingFile: (file, doc) => set({ workingFile: file, doc }),
      setModified: (modified) => set({ modified }),
      setScale: (scale) => set({ scale }),
      setOrigin: (origin) => set({ origin }),
      setSelection: (selections) => set({ selection: selections }),
      setActiveHandler: (handlerId) => set({ activeHandler: handlerId }),
      setActiveHandlerLock: (lock) => set({ activeHandlerLock: lock }),
      setDragging: (dragging) => set({ dragging }),
    }),
    {
      name: "editor",
      partialize: (state) => ({
        workingFile: state.workingFile,
      }),
    }
  )
);
