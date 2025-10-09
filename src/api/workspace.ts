import { readDir, exists, mkdir } from "@tauri-apps/plugin-fs";
import { join, documentDir } from "@tauri-apps/api/path";

const WORKSPACE_NAME = "Nakso";
const CONFIG_DIR_NAME = ".nakso";
const DRAFT_DIR_NAME = "Draft";
const EXT_NAME = ".nakso";

export type FileEntry = {
  isDirectory: boolean;
  fullPath: string;
  name: string;
};

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

async function ensureDir(path: string): Promise<string> {
  const existsDir = await exists(path);
  if (!existsDir) {
    await mkdir(path, { recursive: true });
  }
  return path;
}

async function getWorkspaceDir(): Promise<string> {
  const docDir = await documentDir();
  const dir = await join(docDir, WORKSPACE_NAME);
  return dir;
}

async function ensureWorkspace(): Promise<string> {
  const dir = await getWorkspaceDir();
  await ensureDir(dir);
  const draft = await join(dir, DRAFT_DIR_NAME);
  await ensureDir(draft);
  const config = await join(dir, CONFIG_DIR_NAME);
  await ensureDir(config);
  return dir;
}

async function getFolders(): Promise<FileEntry[]> {
  const dir = await ensureWorkspace();
  const files = await readDir(dir);
  // map to FileEntry
  const fileEntries = [];
  for (const f of files) {
    if (f.isDirectory && !f.name.startsWith(".")) {
      fileEntries.push({
        isDirectory: true,
        fullPath: await join(dir, f.name),
        name: f.name,
      });
    }
  }
  // sort by name, but put Draft folder first
  const sorted = fileEntries.sort((a, b) => a.name.localeCompare(b.name));
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

async function getFiles(path: string): Promise<FileEntry[]> {
  const files = await readDir(path);
  const fileEntries = [];
  for (const f of files) {
    if (!f.isDirectory && f.name.endsWith(EXT_NAME)) {
      fileEntries.push({
        isDirectory: f.isDirectory,
        fullPath: await join(path, f.name),
        name: f.name,
      });
    }
  }
  return fileEntries;
}

export const workspace = {
  ensureWorkspace,
  getFolders,
  getRecentFiles,
  getFavoriteFiles,
  getFiles,
};
