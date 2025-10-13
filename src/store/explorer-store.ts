import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { FileSortType, workspace } from "@/api/workspace";

const PAGE_SIZE = 5; // FIXME: set to 30, 50, or 100?

export interface ExplorerState {
  folders: FileEntry[];
  currentFolder: string | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  sortBy: FileSortType;
  initialize(): Promise<void>;
  setCurrentFolder: (path: string) => Promise<void>;
  fetchFiles: () => Promise<void>;
  setSortBy: (sortBy: FileSortType) => void;
  updateFile: (path: string) => void;
}

export const useExplorerStore = create<ExplorerState>()((set, get) => ({
  currentFolder: null,
  folders: [],
  files: [],
  loadedFiles: [],
  sortBy: { field: "mtime", direction: "desc" },
  initialize: async () => {
    await workspace.ensureWorkspace();
    const folders = await workspace.getFolders();
    set({ folders });
  },
  setCurrentFolder: async (path) => {
    const sortBy = get().sortBy;
    const files = workspace.sortFiles(await workspace.getFiles(path), sortBy);
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
    const files = workspace.sortFiles(get().files, sortBy);
    set({ sortBy: { ...sortBy }, files: [...files], loadedFiles: [] });
  },
  updateFile: async (path) => {
    const file = get().files.find((f) => f.fullPath === path);
    if (file) {
      const updated = await workspace.getFileEntry(path);
      set((state) => {
        const files = workspace.sortFiles(
          state.files.map((f) => (f.fullPath === path ? updated : f)),
          state.sortBy
        );
        return { files, loadedFiles: [] };
      });
    }
  },
}));
