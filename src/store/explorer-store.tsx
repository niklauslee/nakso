import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const PAGE_SIZE = 5;

export interface ExplorerState {
  path: string | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  setPath: (path: string) => Promise<void>;
  fetchFiles: () => Promise<void>;
}

export const useExplorertore = create<ExplorerState>()(
  devtools(
    (set) => ({
      path: null,
      files: [],
      loadedFiles: [],
      setPath: async (path) => {
        const files = await window.api.workspace.getFiles(path);
        set({ path, files, loadedFiles: [] });
      },
      fetchFiles: async () => {
        set((state) => {
          const nextFiles = state.files.slice(
            0,
            state.loadedFiles.length + PAGE_SIZE
          );
          return { loadedFiles: nextFiles };
        });
      },
    }),
    { name: "ExplorerStore" }
  )
);
