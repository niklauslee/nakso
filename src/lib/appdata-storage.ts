import {
  BaseDirectory,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { createJSONStorage, StateStorage } from "zustand/middleware";

const fileStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      return await readTextFile(`${name}.json`, {
        baseDir: BaseDirectory.AppData,
      });
    } catch (e) {
      console.warn(`Failed to read state from file: ${name}.json`, e);
    }
    return null;
  },

  setItem: async (name, value) => {
    try {
      await writeTextFile(`${name}.json`, value, {
        baseDir: BaseDirectory.AppData,
      });
    } catch (e) {
      console.warn(`Failed to write state to file: ${name}.json`, e);
    }
  },

  removeItem: async (name) => {
    try {
      await remove(`${name}.json`, { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.warn(`Failed to remove state file: ${name}.json`, e);
    }
  },
};

export const appDataStorage = createJSONStorage(() => fileStorage);
