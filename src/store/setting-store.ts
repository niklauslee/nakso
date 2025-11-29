import { SETTINGS_FILE_NAME } from "@/const";
import { appDataStorage } from "@/lib/appdata-storage";
import { ExportImageOptions } from "@dgmjs/export";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingState {
  workspaceDir: string | null;
  darkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showSidebar: boolean;
  exportImageOptions: ExportImageOptions;
  setWorkspaceDir: (dirPath: string | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;
  setShowSidebar: (show: boolean) => void;
  setExportImageOptions: (options: Partial<ExportImageOptions>) => void;
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
      exportImageOptions: {
        scale: 1,
        dark: false,
        fillBackground: true,
        format: "image/png",
        margin: 4,
      },
      setWorkspaceDir: (dirPath) => set(() => ({ workspaceDir: dirPath })),
      setDarkMode: (darkMode) => set(() => ({ darkMode })),
      toggleSnapToGrid: () =>
        set((state) => ({
          showGrid: !state.snapToGrid,
          snapToGrid: !state.snapToGrid,
        })),
      toggleSnapToObjects: () =>
        set((state) => ({ snapToObjects: !state.snapToObjects })),
      setShowSidebar: (show) => set({ showSidebar: show }),
      setExportImageOptions: (options) =>
        set((state) => ({
          exportImageOptions: {
            ...state.exportImageOptions,
            ...options,
          },
        })),
    }),
    { name: SETTINGS_FILE_NAME, storage: appDataStorage }
  )
);
