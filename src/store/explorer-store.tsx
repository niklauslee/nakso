import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SortType = {
  field: "name" | "mtime" | "birthtime";
  direction: "asc" | "desc";
};

const PAGE_SIZE = 5;

export interface ExplorerState {
  path: string | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  sortBy: SortType;
  setPath: (path: string) => Promise<void>;
  fetchFiles: () => Promise<void>;
  setSortBy: (sortBy: SortType) => void;
  updateFile: (path: string) => void;
}

export const useExplorertore = create<ExplorerState>()(
  devtools(
    (set, get) => ({
      path: null,
      files: [],
      loadedFiles: [],
      sortBy: { field: "mtime", direction: "desc" },
      setPath: async (path) => {
        const sortBy = get().sortBy;
        const files = sortFiles(
          await window.api.workspace.getFiles(path),
          sortBy
        );
        set({ path, files, sortBy, loadedFiles: [] });
      },
      fetchFiles: async () => {
        set((state) => {
          const nextFiles = get().files.slice(
            0,
            state.loadedFiles.length + PAGE_SIZE
          );
          return { loadedFiles: nextFiles };
        });
      },
      setSortBy: (sortBy) => {
        const files = sortFiles(get().files, sortBy);
        set({ sortBy: { ...sortBy }, files: [...files], loadedFiles: [] });
      },
      updateFile: async (path) => {
        const file = get().files.find((f) => f.fullPath === path);
        if (file) {
          const updated = await window.api.workspace.getFileEntry(path);
          set((state) => {
            const files = state.files.map((f) =>
              f.fullPath === path ? updated : f
            );
            return { files, loadedFiles: [] };
          });
        }
      },
    }),
    { name: "ExplorerStore" }
  )
);

function sortFiles(files: FileEntry[], sortBy: SortType): FileEntry[] {
  return files.sort((a, b) => {
    let compare = 0;
    if (sortBy.field === "name") {
      compare = a.name.localeCompare(b.name);
    } else if (sortBy.field === "mtime") {
      compare = (a.mtime?.getTime() ?? 0) - (b.mtime?.getTime() ?? 0);
    } else if (sortBy.field === "birthtime") {
      compare = (a.birthtime?.getTime() ?? 0) - (b.birthtime?.getTime() ?? 0);
    }
    return sortBy.direction === "asc" ? compare : -compare;
  });
}
