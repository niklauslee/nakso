import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WorkspaceState {
  path: string;
  recents: any[];
  favorites: any[];
  folders: any[];
  initialize(): Promise<void>;
  update(): Promise<void>;
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
      update: async () => {
        const workspace = window.api.workspace;
        const folders = await workspace.getFolders();
        set({ folders });
      },
    }),
    { name: "WorkspaceStore" }
  )
);
