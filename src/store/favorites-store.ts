import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceStorage } from "../lib/workspace-storage";

export interface FavoritesState {
  files: string[];
  addToFavorites(path: string): void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      files: [],
      addToFavorites: (path: string) =>
        set((state) => {
          const files = state.files.filter((p) => p !== path);
          files.unshift(path);
          return { files: [...files] };
        }),
    }),
    { name: "favorites", storage: workspaceStorage }
  )
);
