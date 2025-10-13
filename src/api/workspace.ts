import {
  readDir,
  exists,
  mkdir,
  readTextFile,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { join, documentDir, basename } from "@tauri-apps/api/path";

export const WORKSPACE_NAME = "Nakso";
export const CONFIG_DIR_NAME = ".nakso";
export const DRAFTS_DIR_NAME = "Drafts";
export const EXT_NAME = ".nakso";

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
  /Drafts
  /Folder1
    /file1.nakso
    /file2.nakso
  /Folder2
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
  const drafts = await join(dir, DRAFTS_DIR_NAME);
  await ensureDir(drafts);
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
  // sort by name, but put Drafts folder first
  const sorted = fileEntries.sort((a, b) => a.name.localeCompare(b.name));
  const draftsFolderIndex = sorted.findIndex((d) => d.name === DRAFTS_DIR_NAME);
  if (draftsFolderIndex > 0) {
    const [drafts] = sorted.splice(draftsFolderIndex, 1);
    sorted.unshift(drafts);
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
    isDirectory: info.isDirectory,
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

async function existsFile(path: string): Promise<boolean> {
  return await exists(path);
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
  existsFile,
  readFile,
  writeFile,
};
