import { readDir, exists, mkdir } from "@tauri-apps/plugin-fs";
import { join, documentDir } from "@tauri-apps/api/path";

const WORKSPACE_NAME = "Nakso";
const CONFIG_DIR_NAME = ".nakso";
const DRAFT_DIR_NAME = "Draft";

/*
~/Documents/Nakso
  /.nakso
    /workspace.json
    /trash
    /draft
  /folder1
    /file1.nakso
    /file2.nakso
  /folder2
*/

async function ensureDir(path: string) {
  const existsDir = await exists(path);
  if (!existsDir) {
    await mkdir(path, { recursive: true });
  }
  return path;
}

async function getWorkspaceDir() {
  const docDir = await documentDir();
  const dir = await join(docDir, WORKSPACE_NAME);
  return dir;
}

async function ensureWorkspace() {
  const dir = await getWorkspaceDir();
  await ensureDir(dir);
  const draft = await join(dir, DRAFT_DIR_NAME);
  await ensureDir(draft);
  const config = await join(dir, CONFIG_DIR_NAME);
  await ensureDir(config);
  return dir;
}

async function getFolders() {
  const dir = await ensureWorkspace();
  const files = await readDir(dir);
  const dirs = files.filter(
    (file) => file.isDirectory && !file.name.startsWith(".")
  );
  // sort dirs by name, but put Draft folder first
  const sorted = dirs.sort((a, b) => a.name.localeCompare(b.name));
  const draftIndex = sorted.findIndex((d) => d.name === DRAFT_DIR_NAME);
  if (draftIndex > 0) {
    const [draft] = sorted.splice(draftIndex, 1);
    sorted.unshift(draft);
  }
  return sorted;
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
  ensureWorkspace,
  getFolders,
  getRecentFiles,
  getFavoriteFiles,
  getFiles,
};
