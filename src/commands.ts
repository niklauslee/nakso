/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, Shape, shapeInstantiator, Store } from "@dgmjs/core";
import { getImageBlob, getSVGImageData } from "@dgmjs/export";
import { z } from "zod";
import { APP_NAME, EXT_NAME, SITE_URL, ZOOMS } from "./const";
import { useEditorStore } from "@/store/editor-store";
import { writeImage } from "@tauri-apps/plugin-clipboard-manager";
import { Image } from "@tauri-apps/api/image";
import { toast } from "sonner";
import { workspace } from "@/api/workspace";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useExplorerStore } from "@/store/explorer-store";
import { useRecentsStore } from "@/store/recents-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useAppStore } from "@/store/app-store";
import { downloadDir, join } from "@tauri-apps/api/path";
import { useAboutDialog } from "@/components/dialogs/about-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useKeyboardShortcutsDialog } from "@/components/dialogs/keyboard-shorcuts-dialog";
import {
  readDir,
  exists,
  remove,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { getFontsInStyle, useFontStore } from "./store/font-store";
import { useExportImageDialog } from "./components/dialogs/export-image-dialog";
import { getImageExt } from "./lib/utils";

/**
 * Find the shapes by the given id array.
 * @param shapeIdArray The id array of the shapes to find.
 */
function findShapeIdArray(shapeIdArray: string[]) {
  const app = window.app;
  const shapeArray = [];
  for (const id of shapeIdArray) {
    const shape = app.editor.store.getById(id);
    if (shape instanceof Shape) {
      shapeArray.push(shape);
    } else {
      throw new Error("Shape not found: shapeId=" + id);
    }
  }
  return shapeArray;
}

export function registerCommands() {
  const app = window.app;

  // file commands -------------------------------------------------------------

  app.commands.register(
    "file:new",
    "Create a new file",
    {
      basePath: z.string().optional(),
    },
    async ({ basePath }) => {
      const app = window.app;
      try {
        await app.ensureSave();
        // generate an unique file name
        let dir = app.getDraftsDir();
        if (basePath) dir = basePath;
        const filePath = await workspace.generateUniqueFileName(dir);
        // create an empty file
        const store = new Store(shapeInstantiator);
        const doc = new Doc();
        const page = new Page();
        page.name = "Page";
        doc.children.push(page);
        page.parent = doc;
        store.setRoot(doc);
        const json = store.toJSON();
        const data = JSON.stringify(json);
        await workspace.writeFile(filePath, data);
        // update the current folder view
        useExplorerStore.getState().addFile(filePath);
        // open the new file
        setTimeout(() => {
          app.commands.execute("file:open", { filePath });
        }, 0);
      } catch (err) {
        toast.error("Failed to create file: ");
        console.error("Failed to create file: ", err);
      }
    },
  );

  app.commands.register(
    "file:open",
    "Open a file.",
    {
      filePath: z.string(),
    },
    async ({ filePath }) => {
      try {
        await window.app.ensureSave();
        const data = await workspace.readFile(filePath);
        const fileEntry = await workspace.getFileEntry(filePath);
        const json = JSON.parse(data);
        window.app.editor.loadFromJSON(json);
        const doc = window.app.editor.getDoc();
        useEditorStore.getState().setWorkingFile(fileEntry, doc);
        useExplorerStore.getState().updateFile(filePath);
        useExplorerStore.getState().setView("editor");
      } catch (err) {
        toast.error("Failed to open file: " + filePath);
        console.error("[] Failed to open file: " + filePath, err);
      }
    },
  );

  app.commands.register(
    "file:save",
    "Save the working file",
    {},
    async ({}) => {
      try {
        const workingFile = useEditorStore.getState().workingFile;
        const modified = useEditorStore.getState().modified;
        if (workingFile && modified) {
          const app = window.app;
          const content = JSON.stringify(app.editor.store.toJSON());
          await workspace.writeFile(workingFile.fullPath, content);
          useEditorStore.getState().setModified(false);
          useExplorerStore.getState().updateFile(workingFile.fullPath);
          useRecentsStore.getState().addToRecents(workingFile.fullPath);
        }
      } catch (error) {
        toast.error("Failed to save file");
        console.error("Failed to save file", error);
      }
    },
  );

  app.commands.register(
    "file:rename",
    "Rename a file.",
    {
      filePath: z.string(),
      newName: z.string(),
    },
    async ({ filePath, newName }) => {
      try {
        const oldPath = filePath;
        const { dir: baseDir } = await workspace.parsePath(oldPath);
        const newPath = await join(baseDir, newName + EXT_NAME);
        if (oldPath === newPath) return;
        // check new name already exists
        if (await workspace.existsFile(newPath)) {
          toast.error("File already exists.");
          return;
        }
        // rename file in workspace
        await workspace.renameFile(filePath, newPath);
        // update all states
        const newEntry = await workspace.getFileEntry(newPath);
        useExplorerStore.getState().renameFile(filePath, newPath);
        useRecentsStore.getState().replaceRecentItem(filePath, newPath);
        useFavoritesStore.getState().updateFavoriteItem(filePath, newPath);
        if (filePath === useEditorStore.getState().workingFile?.fullPath) {
          useEditorStore
            .getState()
            .setWorkingFile(newEntry, useEditorStore.getState().doc!);
        }
      } catch (err) {
        toast.error("Failed to rename file.");
        console.error("Failed to rename file:", err);
      }
    },
  );

  app.commands.register(
    "file:delete",
    "Delete files.",
    {
      filePaths: z.array(z.string()),
    },
    async ({ filePaths }) => {
      try {
        for (const filePath of filePaths) {
          await workspace.removeFile(filePath);
          useExplorerStore.getState().removeFile(filePath);
        }
      } catch (err) {
        toast.error("Failed to delete files.");
        console.error("Failed to delete files:", err);
      }
    },
  );

  app.commands.register(
    "file:rename-folder",
    "Rename a folder.",
    {
      dirPath: z.string(),
      newName: z.string(),
    },
    async ({ dirPath, newName }) => {
      const app = window.app;
      try {
        const oldPath = dirPath;
        const { dir: baseDir } = await workspace.parsePath(oldPath, true);
        const newPath = await join(baseDir, newName);
        if (oldPath === newPath) return;
        // check new name already exists
        if (await workspace.existsFile(newPath)) {
          toast.error("Folder already exists.");
          return;
        }
        // rename folder in workspace
        await workspace.renameFile(dirPath, newPath);
        // update all states
        const workspaceDir = app.getWorkspaceDir();
        useExplorerStore.getState().fetchFolders(workspaceDir);
        useRecentsStore.getState().replacePath(oldPath, newPath);
        useFavoritesStore.getState().replacePath(oldPath, newPath);
        setTimeout(() => {
          const newFolder = useExplorerStore.getState().findFolder(newPath);
          useExplorerStore.getState().setCurrentFolder(newFolder);
        }, 100);
      } catch (err) {
        toast.error("Failed to rename folder.");
        console.error("Failed to rename folder:", err);
      }
    },
  );

  app.commands.register(
    "file:delete-folder",
    "Delete a folder permanently.",
    {
      dirPath: z.string(),
    },
    async ({ dirPath }) => {
      const app = window.app;
      try {
        // check directory exists
        if (!(await exists(dirPath))) {
          toast.error("Folder does not exist.");
          return;
        }
        // check directory is empty
        const files = await readDir(dirPath);
        if (files.length > 0) {
          toast.error("Folder is not empty.");
          return;
        }
        // delete folder
        await remove(dirPath);
        // update all states
        const workspaceDir = app.getWorkspaceDir();
        useExplorerStore.getState().fetchFolders(workspaceDir);
        // select draft folder after deletion
        setTimeout(() => {
          const draftFolder = useExplorerStore
            .getState()
            .findFolder(app.getDraftsDir());
          useExplorerStore.getState().setCurrentFolder(draftFolder);
        }, 100);
      } catch (err) {
        toast.error("Failed to delete folder.");
        console.error("Failed to delete folder:", err);
      }
    },
  );

  app.commands.register(
    "file:duplicate",
    "Duplicate a file.",
    {
      filePath: z.string(),
    },
    async ({ filePath }) => {
      try {
        const parsed = await workspace.parsePath(filePath);
        const baseDir = parsed.dir;
        const currentName = parsed.name;
        const newPath = await workspace.generateUniqueFileName(
          baseDir,
          `Copy of ${currentName}`,
        );
        const data = await workspace.readFile(filePath);
        await workspace.writeFile(newPath, data);
        return newPath;
      } catch (err) {
        toast.error("Failed to duplicate file.");
        console.error("Failed to duplicate file:", err);
      }
    },
  );

  app.commands.register(
    "file:add-to-favorites",
    "Add a file to favorites.",
    {
      filePath: z.string(),
    },
    async ({ filePath }) => {
      try {
        useFavoritesStore.getState().addToFavorites(filePath);
      } catch (err) {
        toast.error("Failed to add file to favorites.");
        console.error("Failed to add file to favorites:", err);
      }
    },
  );

  app.commands.register(
    "file:remove-from-favorites",
    "Remove a file from favorites.",
    {
      filePath: z.string(),
    },
    async ({ filePath }) => {
      try {
        useFavoritesStore.getState().removeFromFavorites(filePath);
      } catch (err) {
        toast.error("Failed to remove file from favorites.");
        console.error("Failed to remove file from favorites:", err);
      }
    },
  );

  app.commands.register(
    "file:new-folder",
    "Create a new folder in the specified base directory.",
    {
      basePath: z.string().optional(),
      dirName: z.string(),
    },
    async ({ basePath, dirName }) => {
      const app = window.app;
      try {
        const workspaceDir = app.getWorkspaceDir();
        let dir = workspaceDir;
        if (basePath) dir = basePath;
        const newFolderPath = await workspace.generateUniqueFileName(
          dir,
          dirName,
          "",
        );
        await workspace.makeDir(newFolderPath);
        useExplorerStore.getState().fetchFolders(workspaceDir);
        const dirEntry = await workspace.getFileEntry(newFolderPath);
        useExplorerStore.getState().setCurrentFolder(dirEntry);
        useExplorerStore.getState().setView("folder");
      } catch (err) {
        toast.error("Failed to create new folder.");
        console.error("Failed to create new folder:", err);
      }
    },
  );

  app.commands.register(
    "file:move",
    "Move files to a folder.",
    {
      filePaths: z.array(z.string()),
      newPath: z.string(),
    },
    async ({ filePaths, newPath }) => {
      try {
        for (const filePath of filePaths) {
          const { base } = await workspace.parsePath(filePath);
          const newFilePath = await workspace.generateUniqueFileName(
            newPath,
            base.replace(EXT_NAME, ""),
          );
          if (filePath === newFilePath) continue;
          await workspace.renameFile(filePath, newFilePath);
          useExplorerStore.getState().removeFile(filePath);
          useRecentsStore.getState().replaceRecentItem(filePath, newFilePath);
          useFavoritesStore
            .getState()
            .replaceFavoriteItem(filePath, newFilePath);
        }
      } catch (err) {
        toast.error("Failed to move file.");
        console.error("Failed to move file:", err);
      }
    },
  );

  app.commands.register(
    "file:move-to-trash",
    "Move files to trash.",
    {
      filePaths: z.array(z.string()),
    },
    async ({ filePaths }) => {
      try {
        let workspaceDir = app.getWorkspaceDir();
        for (const filePath of filePaths) {
          await workspace.moveToTrash(workspaceDir, filePath);
          useRecentsStore.getState().removeFromRecents(filePath);
          useFavoritesStore.getState().removeFromFavorites(filePath);
          useExplorerStore.getState().removeFile(filePath);
        }
      } catch (err) {
        toast.error("Failed to move file to trash.");
        console.error("Failed to move file to trash:", err);
      }
    },
  );

  app.commands.register(
    "file:empty-trash",
    "Empty the trash folder.",
    {},
    async () => {
      try {
        const app = window.app;
        const trashFolder = app.getTrashFolder();
        const files = await workspace.getFiles(trashFolder.fullPath);
        for (const file of files) {
          await workspace.removeFile(file.fullPath);
        }
        setTimeout(() => {
          useExplorerStore.getState().setCurrentFolder(trashFolder, true);
        }, 100);
      } catch (err) {
        toast.error("Failed to empty trash.");
        console.error("Failed to empty trash:", err);
      }
    },
  );

  app.commands.register(
    "file:export-image",
    "Export as an image",
    {
      shapeIdArray: z.array(z.string()).optional().default([]),
      format: z
        .enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"])
        .optional()
        .default("image/png"),
      scale: z.number().optional().default(1),
      dark: z.boolean().optional(),
      fillBackground: z.boolean().optional().default(true),
      margin: z.number().optional().default(4),
    },
    async ({ shapeIdArray, format, scale, dark, fillBackground, margin }) => {
      const app = window.app;
      const canvas = app.editor.canvas;
      const page = app.editor.getCurrentPage();
      if (!page) {
        throw new Error("No page found");
      }
      const shapes = findShapeIdArray(shapeIdArray);
      const darkMode = useSettingStore.getState().darkMode;
      const fonts = useFontStore.getState().fonts;
      const exportOptions = {
        format,
        scale,
        dark: dark ?? darkMode,
        fillBackground,
        margin,
      };
      switch (format) {
        case "image/png":
        case "image/jpeg":
        case "image/webp": {
          const data = await getImageBlob(canvas, page, shapes, exportOptions);
          const arrayBuffer = await data!.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const workingFile = useEditorStore.getState().workingFile;
          const fileName = workingFile?.name ?? APP_NAME;
          const fileExt = "." + getImageExt(exportOptions);
          const downloadFolder = await downloadDir();
          const filePath = await workspace.generateUniqueFileName(
            downloadFolder,
            fileName,
            fileExt,
          );
          await writeFile(filePath, uint8Array);
          return data;
        }
        case "image/svg+xml": {
          const data = await getSVGImageData(
            canvas,
            page,
            shapes,
            exportOptions,
            getFontsInStyle(fonts, SITE_URL),
          );
          const workingFile = useEditorStore.getState().workingFile;
          const fileName = workingFile?.name ?? APP_NAME;
          const fileExt = "." + getImageExt(exportOptions);
          const downloadFolder = await downloadDir();
          const filePath = await workspace.generateUniqueFileName(
            downloadFolder,
            fileName,
            fileExt,
          );
          await writeTextFile(filePath, data);
          return data;
        }
      }
    },
  );

  app.commands.register("file:quit", "Quit the application", {}, async () => {
    const app = window.app;
    await app.ensureSave();
    setTimeout(() => {
      window.api.window.quit();
    }, 100);
  });

  // edit commands -------------------------------------------------------------

  app.commands.register("edit:undo", "Undo", {}, async () =>
    window.app.editor.actions.undo(),
  );

  app.commands.register("edit:redo", "Redo", {}, async () =>
    window.app.editor.actions.redo(),
  );

  app.commands.register(
    "edit:delete",
    "Delete shapes given shape ids or selected shapes",
    { shapeIdArray: z.array(z.string()).optional() },
    async ({ shapeIdArray }) => {
      const app = window.app;
      if (shapeIdArray) {
        const shapes = findShapeIdArray(shapeIdArray);
        app.editor.actions.remove(shapes);
      } else {
        app.editor.actions.remove();
      }
      return shapeIdArray;
    },
  );

  app.commands.register(
    "edit:copy",
    "Copy shapes given shape ids or selected shapes",
    { shapeIdArray: z.array(z.string()).optional() },
    async ({ shapeIdArray }) => {
      const app = window.app;
      if (shapeIdArray) {
        const shapes = findShapeIdArray(shapeIdArray);
        await app.editor.actions.copy(shapes);
      } else {
        await app.editor.actions.copy();
      }
      return shapeIdArray;
    },
  );

  app.commands.register(
    "edit:cut",
    "Cut shapes given shape ids or selected shapes",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const app = window.app;
      if (shapeIdArray) {
        const shapes = findShapeIdArray(shapeIdArray);
        await app.editor.actions.cut(shapes);
      } else {
        await app.editor.actions.cut();
      }
      return shapeIdArray;
    },
  );

  app.commands.register(
    "edit:paste",
    "Paste shapes from clipboard",
    {},
    async () => {
      const app = window.app;
      const pasted = await app.editor.actions.paste();
      return pasted.map((shape) => shape.id);
    },
  );

  app.commands.register(
    "edit:duplicate",
    "Duplicate shapes given shape ids or selected shapes",
    {
      shapeIdArray: z.array(z.string()).optional(),
      parentId: z.string().optional(),
      dx: z.number().optional(),
      dy: z.number().optional(),
    },
    async ({ shapeIdArray, parentId, dx, dy }) => {
      const app = window.app;
      let duplicated: Shape[] = [];
      let parent: Shape | undefined;
      if (parentId) {
        parent = app.editor.store.getById(parentId) as Shape;
      }
      if (shapeIdArray) {
        const shapes = findShapeIdArray(shapeIdArray);
        duplicated = app.editor.actions.duplicate(shapes, dx, dy, parent);
      } else {
        const shapes = app.editor.selection.getShapes();
        duplicated = app.editor.actions.duplicate(shapes, dx, dy, parent);
      }
      return duplicated.map((shape) => shape.id);
    },
  );

  app.commands.register("edit:select-all", "Select all shapes", {}, async () =>
    window.app.editor.selection.selectAll(),
  );

  app.commands.register(
    "edit:copy-image-to-clipboard",
    "Copy the specified shapes image to clipboard",
    {
      shapeIdArray: z.array(z.string()).optional().default([]),
      format: z
        .enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"])
        .optional()
        .default("image/png"),
      scale: z.number().optional().default(1),
      dark: z.boolean().optional(),
      fillBackground: z.boolean().optional().default(true),
      margin: z.number().optional().default(4),
    },
    async ({ shapeIdArray, format, scale, dark, fillBackground, margin }) => {
      const app = window.app;
      const canvas = app.editor.canvas;
      const page = app.editor.getCurrentPage();
      if (!page) {
        throw new Error("No page found");
      }
      const shapes = findShapeIdArray(shapeIdArray);
      const darkMode = useSettingStore.getState().darkMode;
      const fonts = useFontStore.getState().fonts;
      const exportOptions = {
        format,
        scale,
        dark: dark ?? darkMode,
        fillBackground,
        margin,
      };
      switch (format) {
        case "image/png":
        case "image/jpeg":
        case "image/webp": {
          const data = await getImageBlob(canvas, page, shapes, exportOptions);
          const arrayBuffer = await data!.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const image = await Image.fromBytes(uint8Array);
          writeImage(image);
          return data;
        }
        case "image/svg+xml": {
          const data = await getSVGImageData(
            canvas,
            page,
            shapes,
            exportOptions,
            getFontsInStyle(fonts, SITE_URL),
          );
          // const base64 = btoa(unescape(encodeURIComponent(data)));
          return data;
        }
      }
    },
  );

  // shape commands ------------------------------------------------------------

  app.commands.register(
    "shape:group",
    "Group a set of shapes. If no shapes are given, group selected shapes.",
    {
      shapeIdArray: z.array(z.string()).optional(),
      parentId: z.string().optional(),
    },
    async ({ shapeIdArray, parentId }) => {
      const app = window.app;
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      let parent: Shape | undefined;
      if (parentId) {
        parent = app.editor.store.getById(parentId) as Shape;
        if (!(parent instanceof Shape)) {
          throw new Error("Parent not found: parentId=" + parentId);
        }
      }
      if (shapes.length > 1) {
        const group = window.app.editor.actions.group(shapes, parent);
        return group?.id;
      }
    },
  );

  app.commands.register(
    "shape:ungroup",
    "Ungroup given groups. If no groups are given, ungroup selected groups.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const app = window.app;
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      if (shapes.length > 0) {
        window.app.editor.actions.ungroup(shapes);
      }
    },
  );

  app.commands.register(
    "shape:move",
    "Move shapes",
    {
      shapeId: z.string().optional(),
      dx: z.number().optional().default(0),
      dy: z.number().optional().default(0),
    },
    async ({ shapeId, dx, dy }) => {
      const app = window.app;
      let shapesToMove = [];
      if (shapeId) {
        const shape = app.editor.store.getById(shapeId);
        if (shape instanceof Shape) {
          shapesToMove = [shape];
        } else {
          throw new Error("Shape not found: shapeId=" + shapeId);
        }
      } else {
        shapesToMove = app.editor.selection.getShapes();
      }
      if (shapesToMove.length > 0) {
        app.editor.actions.move(dx, dy, shapesToMove);
      }
    },
  );

  app.commands.register(
    "shape:move-up",
    "Move selected shapes up",
    {},
    async () =>
      await window.app.commands.execute("shape:move", {
        dy: -window.app.editor.getGridSize()[1],
      }),
  );

  app.commands.register(
    "shape:move-down",
    "Move selected shapes down",
    {},
    async () =>
      await window.app.commands.execute("shape:move", {
        dy: window.app.editor.getGridSize()[1],
      }),
  );

  app.commands.register(
    "shape:move-left",
    "Move selected shapes left",
    {},
    async () =>
      await window.app.commands.execute("shape:move", {
        dx: -window.app.editor.getGridSize()[0],
      }),
  );

  app.commands.register(
    "shape:move-right",
    "Move selected shapes right",
    {},
    async () =>
      await window.app.commands.execute("shape:move", {
        dx: window.app.editor.getGridSize()[0],
      }),
  );

  app.commands.register(
    "shape:move-up-1px",
    "Move selected shapes up as 1px",
    {},
    async () => window.app.commands.execute("shape:move", { dy: -1 }),
  );

  app.commands.register(
    "shape:move-down-1px",
    "Move selected shapes down as 1px",
    {},
    async () => window.app.commands.execute("shape:move", { dy: 1 }),
  );

  app.commands.register(
    "shape:move-left-1px",
    "Move selected shapes left as 1px",
    {},
    async () => window.app.commands.execute("shape:move", { dx: -1 }),
  );

  app.commands.register(
    "shape:move-right-1px",
    "Move selected shapes right as 1px",
    {},
    async () => window.app.commands.execute("shape:move", { dx: 1 }),
  );

  app.commands.register(
    "shape:toggle-lock",
    "Toggle lock of selected shapes",
    {},
    async () => {
      const app = window.app;
      const editor = app.editor;
      const selection = editor.selection.getShapes();
      const enable = selection.every((s) => s.enable);
      editor.actions.update({ enable: !enable }, selection);
    },
  );

  app.commands.register(
    "shape:toggle-container",
    "Toggle container of selected shapes",
    {},
    async () => {
      const app = window.app;
      const editor = app.editor;
      const selection = editor.selection.getShapes();
      const containable = selection.every((s) => s.containable);
      editor.actions.update({ containable: !containable }, selection);
    },
  );

  // align commands ------------------------------------------------------------

  app.commands.register(
    "align:bring-to-front",
    "Bring shapes to front. If no shapes are given, bring selected shapes to front.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.bringToFront(shapes);
    },
  );

  app.commands.register(
    "align:send-to-back",
    "Send shapes to back. If no shapes are given, send selected shapes to back.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.sendToBack(shapes);
    },
  );

  app.commands.register(
    "align:bring-forward",
    "Bring shapes forward. If no shapes are given, bring selected shapes forward.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.bringForward(shapes);
    },
  );

  app.commands.register(
    "align:send-backward",
    "Send shapes backward. If no shapes are given, send selected shapes backward.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.sendBackward(shapes);
    },
  );

  app.commands.register(
    "align:align-left",
    "Align shapes to left. If no shapes are given, align selected shapes to left.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignLeft(shapes);
    },
  );

  app.commands.register(
    "align:align-right",
    "Align shapes to right. If no shapes are given, align selected shapes to right.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignRight(shapes);
    },
  );

  app.commands.register(
    "align:align-center",
    "Align shapes to center. If no shapes are given, align selected shapes to center.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignCenter(shapes);
    },
  );

  app.commands.register(
    "align:align-top",
    "Align shapes to top. If no shapes are given, align selected shapes to top.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignTop(shapes);
    },
  );

  app.commands.register(
    "align:align-bottom",
    "Align shapes to bottom. If no shapes are given, align selected shapes to bottom.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignBottom(shapes);
    },
  );

  app.commands.register(
    "align:align-middle",
    "Align shapes to middle. If no shapes are given, align selected shapes to middle.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignMiddle(shapes);
    },
  );

  app.commands.register(
    "align:distribute-horizontally",
    "Distribute shapes horizontally. If no shapes are given, distribute selected shapes horizontally.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignHorizontalSpaceAround(shapes);
    },
  );

  app.commands.register(
    "align:distribute-vertically",
    "Distribute shapes vertically. If no shapes are given, distribute selected shapes vertically.",
    {
      shapeIdArray: z.array(z.string()).optional(),
    },
    async ({ shapeIdArray }) => {
      const shapes = shapeIdArray
        ? findShapeIdArray(shapeIdArray)
        : app.editor.selection.getShapes();
      window.app.editor.actions.alignVerticalSpaceAround(shapes);
    },
  );

  // tool commands -------------------------------------------------------------

  app.commands.register(
    "tool:select",
    "Activate select handler",
    {},
    async () => window.app.editor.activateDefaultHandler(),
  );

  app.commands.register("tool:hand", "Activate hand handler", {}, async () =>
    window.app.editor.activateHandler("Hand"),
  );

  app.commands.register(
    "tool:eraser",
    "Activate eraser handler",
    {},
    async () => window.app.editor.activateHandler("Eraser"),
  );

  app.commands.register(
    "tool:rectangle",
    "Activate rectangle handler",
    {},
    async () => window.app.editor.activateHandler("Rectangle"),
  );

  app.commands.register(
    "tool:ellipse",
    "Activate ellipse handler",
    {},
    async () => window.app.editor.activateHandler("Ellipse"),
  );

  app.commands.register("tool:text", "Activate text handler", {}, async () =>
    window.app.editor.activateHandler("Text"),
  );

  app.commands.register("tool:image", "Activate image handler", {}, async () =>
    window.app.editor.activateHandler("Image"),
  );

  app.commands.register(
    "tool:connector",
    "Activate connector handler",
    {},
    async () => window.app.editor.activateHandler("Connector"),
  );

  app.commands.register("tool:line", "Activate line handler", {}, async () =>
    window.app.editor.activateHandler("Line"),
  );

  app.commands.register(
    "tool:freehand",
    "Activate freehand handler",
    {},
    async () => window.app.editor.activateHandler("Freehand"),
  );

  app.commands.register(
    "tool:highlighter",
    "Activate highlighter handler",
    {},
    async () => window.app.editor.activateHandler("Highlighter"),
  );

  // view commands -------------------------------------------------------------

  app.commands.register("view:zoom-in", "Zoom in", {}, async () => {
    const editor = window.app.editor;
    const scale = editor.getScale() || 1;
    let zoomIndex = ZOOMS.indexOf(scale);
    if (zoomIndex < 0) {
      zoomIndex = [...ZOOMS, scale].toSorted().indexOf(scale) - 1;
    }
    if (zoomIndex < ZOOMS.length - 1) {
      editor.zoom(ZOOMS[zoomIndex + 1]);
      useEditorStore.getState().setScale(editor.getScale());
    }
  });

  app.commands.register("view:zoom-out", "Zoom out", {}, async () => {
    const editor = window.app.editor;
    const scale = editor.getScale() || 1;
    let zoomIndex = ZOOMS.indexOf(scale);
    if (zoomIndex < 0) {
      zoomIndex = [...ZOOMS, scale].toSorted().indexOf(scale);
    }
    if (zoomIndex > 0) {
      editor.zoom(ZOOMS[zoomIndex - 1]);
      useEditorStore.getState().setScale(editor.getScale());
    }
  });

  app.commands.register("view:actual-size", "Actual size", {}, async () => {
    const editor = window.app.editor;
    editor.zoom(1);
    useEditorStore.getState().setScale(editor.getScale());
  });

  app.commands.register(
    "view:fit-to-screen",
    "Fit to screen",
    {
      scaleAdjust: z.number().optional().default(1),
      maxScale: z.number().optional().default(1),
    },
    async ({ scaleAdjust, maxScale }) => {
      const editor = window.app.editor;
      editor.fitToScreen(scaleAdjust, maxScale);
      useEditorStore.getState().setScale(editor.getScale());
    },
  );

  app.commands.register("view:scroll-up", "Scroll up", {}, async () => {
    const editor = window.app.editor;
    const grid = editor.getGridSize();
    editor.scroll(0, grid[1]);
  });

  app.commands.register("view:scroll-down", "Scroll down", {}, async () => {
    const editor = window.app.editor;
    const grid = editor.getGridSize();
    editor.scroll(0, -grid[1]);
  });

  app.commands.register("view:scroll-left", "Scroll left", {}, async () => {
    const editor = window.app.editor;
    const grid = editor.getGridSize();
    editor.scroll(grid[1], 0);
  });

  app.commands.register("view:scroll-right", "Scroll right", {}, async () => {
    const editor = window.app.editor;
    const grid = editor.getGridSize();
    editor.scroll(-grid[1], 0);
  });

  app.commands.register(
    "view:scroll-to-center",
    "Scroll to center",
    {},
    async () => {
      const editor = window.app.editor;
      editor.scrollToCenter();
    },
  );

  app.commands.register("view:dark-mode", "Toggle dark mode", {}, async () => {
    const darkMode = useSettingStore.getState().darkMode;
    await getCurrentWindow().setTheme(darkMode ? "light" : "dark");
    useSettingStore.getState().setDarkMode(!darkMode);
  });

  app.commands.register("view:snap-to-grid", "Snap to grid", {}, async () =>
    useSettingStore.getState().toggleSnapToGrid(),
  );

  app.commands.register(
    "view:snap-to-objects",
    "Snap to objects",
    {},
    async () => useSettingStore.getState().toggleSnapToObjects(),
  );

  app.commands.register(
    "view:toggle-sidebar",
    "Toggle sidebar",
    {},
    async () => {
      const show = useSettingStore.getState().showSidebar;
      useSettingStore.getState().setShowSidebar(!show);
      window.app.editor.fit();
    },
  );

  app.commands.register(
    "view:show-settings",
    "Show settings dialog",
    {},
    async () => {
      const setShowSettings = useAppStore.getState().setShowSettings;
      setShowSettings(true);
    },
  );

  app.commands.register(
    "view:file-sort",
    "Show file sort menu",
    {
      sortBy: z.object({
        field: z.enum(["name", "mtime"]),
        direction: z.enum(["asc", "desc"]),
      }),
    },
    async ({ sortBy }) => {
      useExplorerStore.getState().setSortBy(sortBy);
    },
  );

  app.commands.register(
    "view:show-export-image-dialog",
    "Show the export image dialog",
    {
      show: z.boolean().optional().default(true),
    },
    async ({ show }) => {
      useExportImageDialog.getState().show(show);
    },
  );

  app.commands.register("help:about", "Show about dialog", {}, async () =>
    useAboutDialog.getState().show(true),
  );

  app.commands.register(
    "help:keyboard-shortcuts",
    "Show keyboard shortcuts",
    {},
    async () => {
      useKeyboardShortcutsDialog.getState().show(true);
    },
  );

  app.commands.register(
    "help:open-dev-tools",
    "Open dev tools",
    {},
    async () => {
      await invoke("open_devtools");
    },
  );
}
