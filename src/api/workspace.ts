import {
  readDir,
  exists,
  mkdir,
  readTextFile,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { join, documentDir, basename } from "@tauri-apps/api/path";

const WORKSPACE_NAME = "Nakso";
const CONFIG_DIR_NAME = ".nakso";
const DRAFT_DIR_NAME = "Draft";
const EXT_NAME = ".nakso";

export type FileEntry = {
  isDirectory: boolean;
  fullPath: string;
  name: string;
  size: number;
  mode: number;
  atime: Date | null;
  mtime: Date | null;
  birthtime: Date | null;
  readonly: boolean;
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
      const fullPath = await join(dir, f.name);
      const info = await stat(fullPath);
      fileEntries.push({
        isDirectory: true,
        fullPath,
        name: f.name,
        mode: info.mode ?? 0,
        size: info.size,
        atime: info.atime,
        mtime: info.mtime,
        birthtime: info.birthtime,
        readonly: info.readonly,
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
      const fullPath = await join(path, f.name);
      const info = await stat(fullPath);
      fileEntries.push({
        isDirectory: f.isDirectory,
        fullPath,
        name: f.name,
        mode: info.mode ?? 0,
        size: info.size,
        atime: info.atime,
        mtime: info.mtime,
        birthtime: info.birthtime,
        readonly: info.readonly,
      });
    }
  }
  return fileEntries;
}

async function getFileEntry(path: string): Promise<FileEntry> {
  const info = await stat(path);
  const name = await basename(path);
  const fileEntry: FileEntry = {
    isDirectory: false,
    fullPath: path,
    name,
    mode: info.mode ?? 0,
    size: info.size,
    atime: info.atime,
    mtime: info.mtime,
    birthtime: info.birthtime,
    readonly: info.readonly,
  };
  return fileEntry;
}

async function readFile(path: string): Promise<string> {
  const data = await readTextFile(path);
  return data;
}

async function writeFile(path: string, data: string): Promise<void> {
  await writeTextFile(path, data);
}

export const workspace = {
  ensureWorkspace,
  getFolders,
  getRecentFiles,
  getFavoriteFiles,
  getFiles,
  getFileEntry,
  readFile,
  writeFile,
};
