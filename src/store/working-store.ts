import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkingState {
  workingFile: string | null;
  workingFolder: string | null;
  setWorkingFile: (file: string | null) => void;
  setWorkingFolder: (folder: string | null) => void;
}

export const useWorkingStore = create<WorkingState>()(
  persist(
    (set) => ({
      workingFile: null,
      workingFolder: null,
      setWorkingFile: (file) => set(() => ({ workingFile: file })),
      setWorkingFolder: (folder) => set(() => ({ workingFolder: folder })),
    }),
    { name: "working" }
  )
);
