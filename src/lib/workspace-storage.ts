import { createJSONStorage, StateStorage } from "zustand/middleware";
import { workspace } from "@/api/workspace";
import { useSettingStore } from "@/store/setting-store";

const fileStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      const workspacePath = useSettingStore.getState().workspacePath;
      if (!workspacePath) await workspace.ensureWorkspace(workspacePath!);
      return await workspace.readConfigFile(workspacePath!, `${name}.json`);
    } catch (e) {
      console.warn(`Failed to read state from file: ${name}.json`, e);
    }
    return null;
  },

  setItem: async (name, value) => {
    try {
      const workspacePath = useSettingStore.getState().workspacePath;
      if (!workspacePath) await workspace.ensureWorkspace(workspacePath!);
      await workspace.writeConfigFile(workspacePath!, `${name}.json`, value);
    } catch (e) {
      console.warn(`Failed to write state to file: ${name}.json`, e);
    }
  },

  removeItem: async (name) => {
    try {
      const workspacePath = useSettingStore.getState().workspacePath;
      if (!workspacePath) await workspace.ensureWorkspace(workspacePath!);
      await workspace.deleteConfigFile(workspacePath!, `${name}.json`);
    } catch (e) {
      console.warn(`Failed to remove state file: ${name}.json`, e);
    }
  },
};

export const workspaceStorage = createJSONStorage(() => fileStorage);
