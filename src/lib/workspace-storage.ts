import { createJSONStorage, StateStorage } from "zustand/middleware";
import { workspace } from "@/api/workspace";
import { useSettingStore } from "@/store/setting-store";

const fileStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      const workspaceDir = useSettingStore.getState().workspaceDir;
      if (!workspaceDir) await workspace.ensureWorkspace(workspaceDir!);
      return await workspace.readConfigFile(workspaceDir!, name);
    } catch (e) {
      console.warn(`Failed to read state from file: ${name}`, e);
    }
    return null;
  },

  setItem: async (name, value) => {
    try {
      const workspaceDir = useSettingStore.getState().workspaceDir;
      if (!workspaceDir) await workspace.ensureWorkspace(workspaceDir!);
      await workspace.writeConfigFile(workspaceDir!, name, value);
    } catch (e) {
      console.warn(`Failed to write state to file: ${name}`, e);
    }
  },

  removeItem: async (name) => {
    try {
      const workspaceDir = useSettingStore.getState().workspaceDir;
      if (!workspaceDir) await workspace.ensureWorkspace(workspaceDir!);
      await workspace.deleteConfigFile(workspaceDir!, name);
    } catch (e) {
      console.warn(`Failed to remove state file: ${name}`, e);
    }
  },
};

export const workspaceStorage = createJSONStorage(() => fileStorage);
