import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { FileSortType, workspace } from "@/api/workspace";

const PAGE_SIZE = 10; // FIXME: set to 30, 50, or 100?

type ViewType =
  | "editor"
  | "search"
  | "recents"
  | "favorites"
  | "trash"
  | "settings"
  | "folder";

export interface ExplorerState {
  view: ViewType;
  folders: FileEntry[];
  currentFolder: string | null;
  currentFile: string | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  sortBy: FileSortType;
  setView(view: ViewType): void;
  setFolders: (folders: FileEntry[]) => void;
  setCurrentFolder: (path: string) => Promise<void>;
  setCurrentFile: (file: string | null) => void;
  fetchMoreFiles: () => Promise<void>;
  setSortBy: (sortBy: FileSortType) => void;
  addFile: (filePath: string) => void;
  updateFile: (filePath: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  removeFile: (filePath: string) => void;
}

export const useExplorerStore = create<ExplorerState>()((set, get) => ({
  view: "editor",
  currentFolder: null,
  currentFile: null,
  folders: [],
  files: [],
  loadedFiles: [],
  sortBy: { field: "mtime", direction: "desc" },
  setView: (view) => {
    set({ view });
  },
  setFolders: (folders) => set({ folders }),
  setCurrentFolder: async (path) => {
    const sortBy = get().sortBy;
    const allFiles = await workspace.getFiles(path);
    const files = workspace.sortFiles(allFiles, sortBy);
    set({ currentFolder: path, files, sortBy, loadedFiles: [] });
  },
  setCurrentFile: (file) => {
    set({ currentFile: file });
  },
  fetchMoreFiles: async () => {
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
  addFile: async (filePath) => {
    const entry = await workspace.getFileEntry(filePath);
    if (entry) {
      set((state) => {
        return {
          files: [entry, ...state.files],
          loadedFiles: [entry, ...state.loadedFiles],
        };
      });
    }
  },
  updateFile: async (filePath) => {
    const file = get().files.find((f) => f.fullPath === filePath);
    if (file) {
      const updated = await workspace.getFileEntry(filePath);
      set((state) => {
        return {
          files: state.files.map((f) =>
            f.fullPath === filePath ? updated : f
          ),
          loadedFiles: state.loadedFiles.map((f) =>
            f.fullPath === filePath ? updated : f
          ),
        };
      });
    }
  },
  renameFile: async (oldPath, newPath) => {
    const newEntry = await workspace.getFileEntry(newPath);
    set((state) => {
      return {
        files: state.files.map((f) => (f.fullPath === oldPath ? newEntry : f)),
        loadedFiles: state.loadedFiles.map((f) =>
          f.fullPath === oldPath ? newEntry : f
        ),
      };
    });
  },
  removeFile: (filePath) => {
    set((state) => {
      return {
        files: state.files.filter((f) => f.fullPath !== filePath),
        loadedFiles: state.loadedFiles.filter((f) => f.fullPath !== filePath),
      };
    });
  },
}));
