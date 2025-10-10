import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Doc } from "@dgmjs/core";

export interface DocState {
  filePath: string | null;
  doc: Doc | null;
  modified: boolean;
  setFilePath: (filePath: string | null) => void;
  setDoc: (doc: Doc) => void;
  setModified: (modified: boolean) => void;
}

export const useDocStore = create<DocState>()(
  devtools(
    (set) => ({
      filePath: null as string | null,
      doc: null as Doc | null,
      modified: false,
      setFilePath: (filePath) => set({ filePath }),
      setDoc: (diagram) => set({ doc: diagram }),
      setModified: (modified) => set({ modified }),
    }),
    { name: "DocStore" }
  )
);
