import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { FileSortType, workspace } from "@/api/workspace";
import { useFavoritesStore } from "./favorites-store";
import { useRecentsStore } from "./recents-store";
import { persist } from "zustand/middleware";

const PAGE_SIZE = 50; // set to 30, 50, or 100?

type ViewType = "editor" | "folder";

export interface ExplorerState {
  view: ViewType;
  folders: FileEntry[];
  currentFolder: FileEntry | null;
  files: FileEntry[];
  loadedFiles: FileEntry[];
  sortBy: FileSortType;
  getDraftsFolder: () => FileEntry | null;
  setView(view: ViewType): void;
  fetchFolders: (workspaceDir: string) => Promise<void>;
  setFolders: (folders: FileEntry[]) => void;
  setCurrentFolder: (folder: FileEntry | null) => Promise<void>;
  fetchMoreFiles: () => Promise<void>;
  setSortBy: (sortBy: FileSortType) => void;
  addFile: (filePath: string) => void;
  updateFile: (filePath: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  removeFile: (filePath: string) => void;
}

export const useExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      view: "editor",
      currentFolder: null,
      folders: [],
      files: [],
      loadedFiles: [],
      sortBy: { field: "mtime", direction: "desc" },
      getDraftsFolder: () => {
        const folders = get().folders;
        return folders.find((f) => f.tag === "drafts") || null;
      },
      setView: (view) => {
        set({ view });
      },
      setFolders: (folders) => set({ folders }),
      fetchFolders: async (workspaceDir) => {
        const folders = await workspace.getFolders(workspaceDir, true);
        set({ folders });
      },
      setCurrentFolder: async (folder) => {
        if (folder) {
          const sortBy = get().sortBy;
          if (folder.tag === "favorites") {
            const favorites = useFavoritesStore.getState().files;
            const allFiles = await workspace.getFileEntries(favorites);
            const files = workspace.sortFiles(allFiles, sortBy);
            set({ currentFolder: folder, files, sortBy, loadedFiles: [] });
          } else if (folder.tag === "recents") {
            const recents = useRecentsStore.getState().files;
            const allFiles = await workspace.getFileEntries(recents);
            const files = workspace.sortFiles(allFiles, sortBy);
            set({ currentFolder: folder, files, sortBy, loadedFiles: [] });
          } else {
            const allFiles = await workspace.getFiles(folder?.fullPath || "/");
            const files = workspace.sortFiles(allFiles, sortBy);
            set({ currentFolder: folder, files, sortBy, loadedFiles: [] });
          }
        } else {
          set({
            currentFolder: null,
            files: [],
            sortBy: { field: "mtime", direction: "desc" },
            loadedFiles: [],
          });
        }
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
            files: state.files.map((f) =>
              f.fullPath === oldPath ? newEntry : f
            ),
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
            loadedFiles: state.loadedFiles.filter(
              (f) => f.fullPath !== filePath
            ),
          };
        });
      },
    }),
    {
      name: "explorer",
      partialize: (state) => ({
        sortBy: state.sortBy,
      }),
    }
  )
);
