import { FileEntry } from "@/api/workspace";
import { create } from "zustand";

type SortType = {
  field: "name" | "mtime" | "birthtime";
  direction: "asc" | "desc";
};

const PAGE_SIZE = 5; // FIXME: set to 30, 50, or 100?

export interface ExplorerState {
  folders: FileEntry[];
  currentFolder: string | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  sortBy: SortType;
  initialize(): Promise<void>;
  setCurrentFolder: (path: string) => Promise<void>;
  fetchFiles: () => Promise<void>;
  setSortBy: (sortBy: SortType) => void;
  updateFile: (path: string) => void;
}

export const useExplorerStore = create<ExplorerState>()((set, get) => ({
  currentFolder: null,
  folders: [],
  files: [],
  loadedFiles: [],
  sortBy: { field: "mtime", direction: "desc" },
  initialize: async () => {
    const workspace = window.api.workspace;
    await workspace.ensureWorkspace();
    const folders = await workspace.getFolders();
    set({ folders });
  },
  setCurrentFolder: async (path) => {
    const workspace = window.api.workspace;
    const sortBy = get().sortBy;
    const files = sortFiles(await workspace.getFiles(path), sortBy);
    set({ currentFolder: path, files, sortBy, loadedFiles: [] });
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
    const workspace = window.api.workspace;
    const file = get().files.find((f) => f.fullPath === path);
    if (file) {
      const updated = await workspace.getFileEntry(path);
      set((state) => {
        const files = sortFiles(
          state.files.map((f) => (f.fullPath === path ? updated : f)),
          state.sortBy
        );
        return { files, loadedFiles: [] };
      });
    }
  },
}));

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
