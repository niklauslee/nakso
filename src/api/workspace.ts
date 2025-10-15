import {
  readDir,
  exists,
  mkdir,
  readTextFile,
  stat,
  writeTextFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { join, basename } from "@tauri-apps/api/path";
import { CONFIG_FOLDER_NAME, DRAFTS_FOLDER_NAME, EXT_NAME } from "@/const";

export type FileSortType = {
  field: "name" | "mtime" | "birthtime";
  direction: "asc" | "desc";
};

export type FileEntry = {
  isDirectory: boolean;
  fullPath: string;
  basename: string;
  name: string;
  size: number;
  mode: number;
  atime: Date | null;
  mtime: Date | null;
  birthtime: Date | null;
  readonly: boolean;
};

/**
 * Ensure a directory exists, creating it if necessary.
 * Returns the directory path.
 */
async function ensureDir(dirPath: string): Promise<string> {
  const existsDir = await exists(dirPath);
  if (!existsDir) {
    await mkdir(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Ensure the main workspace directory and subdirectories exist.
 * Returns the main workspace directory path.
 */
async function ensureWorkspace(dirPath: string): Promise<string> {
  await ensureDir(dirPath);
  const drafts = await join(dirPath, DRAFTS_FOLDER_NAME);
  await ensureDir(drafts);
  const config = await join(dirPath, CONFIG_FOLDER_NAME);
  await ensureDir(config);
  return dirPath;
}

/**
 * Read all folders in the workspace (only one level deep).
 */
async function getFolders(workspaceDir: string): Promise<FileEntry[]> {
  const entries = await readDir(workspaceDir);
  // map to FileEntry
  const dirEntries = [];
  for (const f of entries) {
    if (f.isDirectory && !f.name.startsWith(".")) {
      const fullPath = await join(workspaceDir, f.name);
      const fileEntry = await getFileEntry(fullPath);
      dirEntries.push(fileEntry);
    }
  }
  // sort by name, but put Drafts folder first
  const sorted = dirEntries.sort((a, b) => a.name.localeCompare(b.name));
  const draftsFolderIndex = sorted.findIndex(
    (d) => d.name === DRAFTS_FOLDER_NAME
  );
  if (draftsFolderIndex > 0) {
    const [drafts] = sorted.splice(draftsFolderIndex, 1);
    sorted.unshift(drafts);
  }
  return sorted;
}

/**
 * Get files in the specified path
 */
async function getFiles(path: string): Promise<FileEntry[]> {
  const files = await readDir(path);
  const fileEntries = [];
  for (const f of files) {
    if (!f.isDirectory && f.name.endsWith(EXT_NAME)) {
      const fullPath = await join(path, f.name);
      const fileEntry = await getFileEntry(fullPath);
      fileEntries.push(fileEntry);
    }
  }
  return fileEntries;
}

/**
 * Get a single file entry by path
 */
async function getFileEntry(path: string): Promise<FileEntry> {
  const info = await stat(path);
  const base = await basename(path);
  const name = base.endsWith(EXT_NAME) ? base.slice(0, -EXT_NAME.length) : base;
  const fileEntry: FileEntry = {
    isDirectory: info.isDirectory,
    fullPath: path,
    basename: base,
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

/**
 * Check if a file exists
 */
async function existsFile(path: string): Promise<boolean> {
  return await exists(path);
}

/**
 * Read file content as text
 */
async function readFile(path: string): Promise<string> {
  const data = await readTextFile(path);
  return data;
}

/**
 * Write text content to a file
 */
async function writeFile(path: string, data: string): Promise<void> {
  await writeTextFile(path, data);
}

async function readConfigFile(
  workspaceDir: string,
  fileName: string
): Promise<string> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await readFile(fullPath);
}

async function writeConfigFile(
  workspaceDir: string,
  fileName: string,
  data: string
): Promise<void> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await writeFile(fullPath, data);
}

async function deleteConfigFile(
  workspaceDir: string,
  fileName: string
): Promise<void> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await remove(fullPath);
}

function sortFiles(files: FileEntry[], sortBy: FileSortType): FileEntry[] {
  return files.sort((a, b) => {
    let compare = 0;
    if (sortBy.field === "name") {
      compare = a.name.localeCompare(b.name);
    } else if (sortBy.field === "mtime") {
      compare = (a.mtime?.getTime() ?? 0) - (b.mtime?.getTime() ?? 0);
    } else if (sortBy.field === "birthtime") {
      compare = (a.birthtime?.getTime() ?? 0) - (b.birthtime?.getTime() ?? 0);
    }
    return sortBy.direction === "asc" ? compare : -compare;
  });
}

export const workspace = {
  ensureWorkspace,
  getFolders,
  getFiles,
  getFileEntry,
  existsFile,
  readFile,
  writeFile,
  readConfigFile,
  writeConfigFile,
  deleteConfigFile,
  sortFiles,
};
