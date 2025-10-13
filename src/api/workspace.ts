import {
  readDir,
  exists,
  mkdir,
  readTextFile,
  stat,
  writeTextFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { join, documentDir, basename } from "@tauri-apps/api/path";

export const WORKSPACE_NAME = "Nakso";
export const CONFIG_FOLDER_NAME = ".nakso";
export const DRAFTS_FOLDER_NAME = "Drafts";
export const EXT_NAME = ".nakso";

export type FileSortType = {
  field: "name" | "mtime" | "birthtime";
  direction: "asc" | "desc";
};

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
    /recents.json
    /favorites.json
    /workspace.json
    /trash
  /Drafts
  /Folder1
    /file1.nakso
    /file2.nakso
  /Folder2
*/

/**
 * Ensure a path exists, creating it if necessary.
 * Returns the path.
 */
async function ensurePath(path: string): Promise<string> {
  const existsPath = await exists(path);
  if (!existsPath) {
    await mkdir(path, { recursive: true });
  }
  return path;
}

/**
 * Get the main workspace path, e.g., ~/Documents/Nakso
 */
async function getPath(): Promise<string> {
  const docPath = await documentDir();
  const path = await join(docPath, WORKSPACE_NAME);
  return path;
}

/**
 * Get the configuration path, e.g., ~/Documents/Nakso/.nakso
 */
async function getConfigPath(): Promise<string> {
  const path = await getPath();
  const configPath = await join(path, CONFIG_FOLDER_NAME);
  return configPath;
}

/**
 * Ensure the main workspace directory and subdirectories exist.
 * Returns the main workspace directory path.
 */
async function ensureWorkspace(): Promise<string> {
  const path = await getPath();
  await ensurePath(path);
  const drafts = await join(path, DRAFTS_FOLDER_NAME);
  await ensurePath(drafts);
  const config = await join(path, CONFIG_FOLDER_NAME);
  await ensurePath(config);
  return path;
}

/**
 * Read all folders in the workspace (only one level deep).
 */
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
        // relPath
        // basebase
        // name
        // extname
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

/**
 * Get a single file entry by path
 */
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

async function readConfigFile(fileName: string): Promise<string> {
  const configPath = await getConfigPath();
  const fullPath = await join(configPath, fileName);
  return await readFile(fullPath);
}

async function writeConfigFile(fileName: string, data: string): Promise<void> {
  const configPath = await getConfigPath();
  const fullPath = await join(configPath, fileName);
  return await writeFile(fullPath, data);
}

async function deleteConfigFile(fileName: string): Promise<void> {
  const configPath = await getConfigPath();
  const fullPath = await join(configPath, fileName);
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
  getPath,
  getConfigPath,
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
