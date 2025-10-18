import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceStorage } from "../lib/workspace-storage";

export interface FavoritesState {
  files: string[];
  addToFavorites(path: string): void;
  removeFromFavorites(path: string): void;
  updateFavoriteItem(oldPath: string, newPath: string): void;
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
      removeFromFavorites: (path: string) =>
        set((state) => ({
          files: state.files.filter((p) => p !== path),
        })),
      updateFavoriteItem: (oldPath: string, newPath: string) =>
        set((state) => {
          const files = state.files.map((p) => (p === oldPath ? newPath : p));
          return { files };
        }),
    }),
    { name: "favorites", storage: workspaceStorage }
  )
);
