import { exit } from "@tauri-apps/plugin-process";

export const window = {
  quit: async () => {
    await exit(0);
  },
};
