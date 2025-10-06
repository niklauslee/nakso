import { exit } from "@tauri-apps/plugin-process";

function quit() {
  exit(0);
}

export const window = {
  quit,
};
