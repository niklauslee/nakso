import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WorkspaceState {
  recents: any[];
  favorites: any[];
  folders: any[];
  update(): Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set) => ({
      recents: [],
      favorites: [],
      folders: [],
      update: async () => {
        const workspace = window.api.workspace;
        const folders = await workspace.getFolders();
        set({ folders });
      },
    }),
    { name: "WorkspaceStore" }
  )
);
