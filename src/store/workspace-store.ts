import { FileEntry } from "@/api/workspace";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WorkspaceState {
  path: string;
  recents: FileEntry[];
  favorites: FileEntry[];
  folders: FileEntry[];
  initialize(): Promise<void>;
  setCurrentFolder(folder: FileEntry | null): void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set) => ({
      path: "",
      recents: [],
      favorites: [],
      folders: [],
      initialize: async () => {
        const workspace = window.api.workspace;
        const path = await workspace.ensureWorkspace();
        const folders = await workspace.getFolders();
        set({ path, folders });
      },
    }),
    { name: "WorkspaceStore" }
  )
);
