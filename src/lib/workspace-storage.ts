import { createJSONStorage, StateStorage } from "zustand/middleware";
import { workspace } from "@/api/workspace";

const fileStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      return await workspace.readConfigFile(`${name}.json`);
    } catch (e) {
      console.warn(`Failed to read state from file: ${name}.json`, e);
    }
    return null;
  },

  setItem: async (name, value) => {
    try {
      await workspace.writeConfigFile(`${name}.json`, value);
    } catch (e) {
      console.warn(`Failed to write state to file: ${name}.json`, e);
    }
  },

  removeItem: async (name) => {
    try {
      await workspace.deleteConfigFile(`${name}.json`);
    } catch (e) {
      console.warn(`Failed to remove state file: ${name}.json`, e);
    }
  },
};

export const workspaceStorage = createJSONStorage(() => fileStorage);
