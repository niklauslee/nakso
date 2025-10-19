import { SETTINGS_FILE_NAME } from "@/const";
import { appDataStorage } from "@/lib/appdata-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingState {
  workspaceDir: string | null;
  darkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showSidebar: boolean;
  setWorkspaceDir: (dirPath: string | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;
  setShowSidebar: (show: boolean) => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      workspaceDir: null,
      darkMode: false,
      showGrid: false,
      snapToGrid: false,
      snapToObjects: false,
      showSidebar: true,
      setWorkspaceDir: (dirPath) => set(() => ({ workspaceDir: dirPath })),
      setDarkMode: (darkMode) => set(() => ({ darkMode })),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleSnapToGrid: () =>
        set((state) => ({ snapToGrid: !state.snapToGrid })),
      toggleSnapToObjects: () =>
        set((state) => ({ snapToObjects: !state.snapToObjects })),
      setShowSidebar: (show) => set({ showSidebar: show }),
    }),
    { name: SETTINGS_FILE_NAME, storage: appDataStorage }
  )
);
