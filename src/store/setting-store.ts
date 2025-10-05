import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface SettingState {
  darkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showSidebar: boolean;
  setDarkMode: (darkMode: boolean) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;
  setShowSidebar: (show: boolean) => void;
}

export const useSettingStore = create<SettingState>()(
  devtools(
    persist(
      (set) => ({
        darkMode: false,
        showGrid: false,
        snapToGrid: false,
        snapToObjects: false,
        showSidebar: true,
        setDarkMode: (darkMode) => set(() => ({ darkMode })),
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
        toggleSnapToGrid: () =>
          set((state) => ({ snapToGrid: !state.snapToGrid })),
        toggleSnapToObjects: () =>
          set((state) => ({ snapToObjects: !state.snapToObjects })),
        setShowSidebar: (show) => set({ showSidebar: show }),
      }),
      { name: "setting-storage" }
    ),
    { name: "SettingStore" }
  )
);
