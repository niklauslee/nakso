import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const MAX_RECENT_FILES = 10;

export interface WorkingState {
  workingFile: string | null;
  currentFolder: string | null;
  recentFiles: string[];
  favoriteFiles: string[];
  setWorkingFile: (file: string | null) => void;
  addRecentFile: (file: string) => void;
  setCurrentFolder: (folder: string | null) => void;
}

export const useWorkingStore = create<WorkingState>()(
  devtools(
    persist(
      (set) => ({
        workingFile: null,
        currentFolder: null,
        recentFiles: [],
        favoriteFiles: [],
        setWorkingFile: (file) => set(() => ({ workingFile: file })),
        addRecentFile: (file) =>
          set((state) => {
            const recentFiles = state.recentFiles.filter((f) => f !== file);
            recentFiles.unshift(file);
            if (recentFiles.length > MAX_RECENT_FILES) {
              recentFiles.pop();
            }
            return { recentFiles };
          }),
        setCurrentFolder: (folder) => set(() => ({ currentFolder: folder })),
      }),
      { name: "working-storage" }
    ),
    { name: "WorkingStore" }
  )
);
