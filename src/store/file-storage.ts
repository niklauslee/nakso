import { createJSONStorage, StateStorage } from "zustand/middleware";
import { workspace } from "@/api/workspace";

const fileStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      return await workspace.readConfigFile(`${name}.json`);
    } catch (e) {
      console.error("Failed to read state from file:", e);
    }
    return null;
  },

  setItem: (name, value) => {
    try {
      workspace.writeConfigFile(`${name}.json`, value);
    } catch (e) {
      console.error("Failed to write state to file:", e);
    }
  },

  removeItem: (name) => {
    try {
      workspace.deleteConfigFile(`${name}.json`);
    } catch (e) {
      console.error("Failed to remove state file:", e);
    }
  },
};

export const workspaceConfigStorage = createJSONStorage(() => fileStorage);
