import { create } from "zustand";
import { persist } from "zustand/middleware";

// Rename to 'WorkspaceStore'.
// Make this store as persistent.
// 0. workspacePath: string | null
// 1. workingFile: string | null
// 2. workingFolder: string | null
// 3. recentFiles
// 4. favoriteFiles

export interface WorkingState {
  workspacePath: string | null;
  workingFile: string | null;
  workingFolder: string | null;
  setWorkingFile: (file: string | null) => void;
  setWorkingFolder: (folder: string | null) => void;
}

export const useWorkingStore = create<WorkingState>()(
  persist(
    (set) => ({
      workspacePath: null,
      workingFile: null,
      workingFolder: null,
      setWorkingFile: (file) => set(() => ({ workingFile: file })),
      setWorkingFolder: (folder) => set(() => ({ workingFolder: folder })),
    }),
    { name: "working" }
  )
);
