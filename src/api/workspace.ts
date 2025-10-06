import { readDir, BaseDirectory } from "@tauri-apps/plugin-fs";

async function getFolders() {
  const files = await readDir("", { baseDir: BaseDirectory.Document });
  return files;
}

function getRecentFiles() {
  return [];
}

function getFavoriteFiles() {
  return [];
}

function getFiles(path: string) {
  return [];
}

export const workspace = {
  getFolders,
  getRecentFiles,
  getFavoriteFiles,
  getFiles,
};
