import {
  readDir,
  exists,
  mkdir,
  readTextFile,
  stat,
  writeTextFile,
  remove,
  rename,
} from "@tauri-apps/plugin-fs";
import { join, basename, dirname, extname, sep } from "@tauri-apps/api/path";
import {
  CONFIG_FOLDER_NAME,
  DRAFTS_FOLDER_NAME,
  DRAFTS_TAG,
  EXT_NAME,
  TRASH_FOLDER_NAME,
} from "@/const";

export type FileSortType = {
  field: "name" | "mtime";
  direction: "asc" | "desc";
};

export type FolderType =
  | "unknown"
  | "normal"
  | "drafts"
  | "trash"
  | "search"
  | "recents"
  | "favorites";

export type FileEntry = {
  isDirectory: boolean;
  fullPath: string;
  dirname: string;
  basename: string;
  name: string;
  extname: string;
  size: number;
  mode: number;
  atime: Date | null;
  mtime: Date | null;
  birthtime: Date | null;
  readonly: boolean;
  tag?: string;
  children?: FileEntry[];
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
  const trash = await join(dirPath, TRASH_FOLDER_NAME);
  await ensureDir(trash);
  return dirPath;
}

/**
 * Read all folders in the workspace.
 */
async function getFolders(
  workspaceDir: string,
  recursive: boolean = false
): Promise<FileEntry[]> {
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
    sorted.unshift({ ...drafts, tag: DRAFTS_TAG });
  }
  // if recursive, get children
  if (recursive) {
    for (const dirEntry of sorted) {
      dirEntry.children = await getFolders(dirEntry.fullPath, true);
    }
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
  const parsed = await parsePath(path, info.isDirectory);
  const fileEntry: FileEntry = {
    isDirectory: info.isDirectory,
    fullPath: path,
    dirname: parsed.dir,
    basename: parsed.base,
    name: parsed.name,
    extname: parsed.ext,
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
 * Get multiple file entries by their paths
 */
async function getFileEntries(paths: string[]): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  for (const path of paths) {
    try {
      const entry = await getFileEntry(path);
      entries.push(entry);
    } catch (e) {}
  }
  return entries;
}

/**
 * Create a FileEntry with default values, overridden by provided partial values
 */
function createFileEntry(fileEntry: Partial<FileEntry>): FileEntry {
  return {
    isDirectory: false,
    fullPath: "",
    dirname: "",
    basename: "",
    name: "",
    extname: "",
    mode: 0,
    size: 0,
    atime: new Date(0),
    mtime: new Date(0),
    birthtime: new Date(0),
    readonly: false,
    ...fileEntry,
  };
}

/**
 * Create a directory at the specified path
 */
async function makeDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/**
 * Check if a file exists
 */
async function existsFile(path: string): Promise<boolean> {
  return await exists(path);
}

/**
 * Rename a file from oldPath to newPath
 */
async function renameFile(oldPath: string, newPath: string): Promise<void> {
  await rename(oldPath, newPath);
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

/**
 * Remove a file at the specified path
 */
async function removeFile(path: string): Promise<void> {
  await remove(path);
}

/**
 * Move a file to the trash folder within the workspace
 */
async function moveToTrash(
  workspaceDir: string,
  filePath: string
): Promise<void> {
  const trashDir = await join(workspaceDir, TRASH_FOLDER_NAME);
  const parsed = await parsePath(filePath);
  const name = parsed.name;
  const newPath = await generateUniqueFileName(trashDir, name);
  await rename(filePath, newPath);
}

/**
 * Search files by keyword in their names within a directory
 */
async function searchFiles(
  dirPath: string,
  keyword: string
): Promise<FileEntry[]> {
  const result: FileEntry[] = [];
  const entries = await readDir(dirPath);
  for (const entry of entries) {
    const fullPath = await join(dirPath, entry.name);
    if (entry.isDirectory) {
      const subResults = await searchFiles(fullPath, keyword);
      result.push(...subResults);
    } else {
      if (
        entry.name.toLowerCase().includes(keyword.toLowerCase()) &&
        entry.name.endsWith(EXT_NAME)
      ) {
        const fileEntry = await getFileEntry(fullPath);
        result.push(fileEntry);
      }
    }
  }
  return result;
}

/**
 * Read a config file from the workspace's config directory
 */
async function readConfigFile(
  workspaceDir: string,
  fileName: string
): Promise<string> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await readFile(fullPath);
}

/**
 * Write a config file to the workspace's config directory
 */
async function writeConfigFile(
  workspaceDir: string,
  fileName: string,
  data: string
): Promise<void> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await writeFile(fullPath, data);
}

/**
 * Delete a config file from the workspace's config directory
 */
async function deleteConfigFile(
  workspaceDir: string,
  fileName: string
): Promise<void> {
  const configDir = await join(workspaceDir, CONFIG_FOLDER_NAME);
  const fullPath = await join(configDir, fileName);
  return await remove(fullPath);
}

/**
 * Sort files based on the specified sort type
 */
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

/**
 * Parse a file path into its components
 */
async function parsePath(
  path: string,
  isDirectory = false
): Promise<{ dir: string; base: string; name: string; ext: string }> {
  const dir = await dirname(path);
  const ext = isDirectory ? "" : "." + (await extname(path));
  const base = await basename(path);
  const name =
    !isDirectory && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
  return { dir, base, name, ext };
}

/**
 * Generate a unique file name in the specified directory.
 * If baseName is provided, use it as the base; otherwise, use the current date.
 */
async function generateUniqueFileName(
  baseDir: string,
  baseName?: string,
  extName: string = EXT_NAME
): Promise<string> {
  if (!baseName) {
    const now = new Date();
    baseName = [
      now.getFullYear().toString(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
  }
  let candidate = `${baseName}${extName}`;
  let candidatePath = await join(baseDir, candidate);
  let suffix = 1;
  while (await exists(candidatePath)) {
    candidate = `${baseName} (${suffix})${extName}`;
    candidatePath = await join(baseDir, candidate);
    suffix += 1;
  }
  return candidatePath;
}

/**
 * Get the platform-specific path separator
 */
function getSeparator(): string {
  return sep();
}

/**
 * Get the relative path from basePath to fullPath
 */
function getRelPath(basePath: string, fullPath: string): string {
  if (fullPath.startsWith(basePath)) {
    const separator = sep();
    const relPath = fullPath.slice(basePath.length);
    // remove leading path separators (cross-platform)
    const sepRegex = new RegExp(`^[${separator.replace(/\\/g, "\\\\")}]+`);
    return relPath.replace(sepRegex, "");
  }
  return fullPath;
}

export const workspace = {
  ensureWorkspace,
  getFolders,
  getFiles,
  getFileEntry,
  getFileEntries,
  createFileEntry,
  makeDir,
  existsFile,
  renameFile,
  readFile,
  writeFile,
  removeFile,
  moveToTrash,
  searchFiles,
  readConfigFile,
  writeConfigFile,
  deleteConfigFile,
  sortFiles,
  parsePath,
  generateUniqueFileName,
  getSeparator,
  getRelPath,
};
