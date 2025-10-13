import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import { Editor, Group } from "@dgmjs/core";
import { CommandManager } from "@/engine/command-manager";
import { KeymapManager } from "@/engine/keymap-manager";
import { Font, insertFontsToDocument, useFontStore } from "@/store/font-store";
import { registerCommands } from "./commands";
import { useSettingStore } from "@/store/setting-store";
import { useKeymapStore } from "@/store/keymap-store";
import { MenuItemState, useMenuStore } from "@/store/menu-store";
import { useWorkingStore } from "@/store/working-store";
import packageJson from "../package.json";
import fontJson from "./fonts.json";
import menuJson from "./menu.json";
import keymapJson from "./keymap.json";
import { AutoSaver } from "./engine/auto-saver";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useExplorerStore } from "./store/explorer-store";

export class AppContext {
  productName: string;
  productId: string;
  version: string;
  platform: string;
  editor: Editor;
  commands: CommandManager;
  keymaps: KeymapManager;
  autoSaver: AutoSaver;

  constructor(editor: Editor) {
    this.productName = packageJson.productName;
    this.productId = packageJson.productId;
    this.version = packageJson.version;
    this.editor = editor;
    this.platform = editor.platform;
    this.commands = new CommandManager();
    this.keymaps = new KeymapManager({
      platform: this.platform,
      commandManager: this.commands,
    });
    this.autoSaver = new AutoSaver(async () => {
      await this.ensureSave();
    });
  }

  async initialize() {
    await this.setupNativeUI();
    await this.wiring();
    await this.loadFonts();
    this.loadKeymap();
    this.loadMenus();
    this.loadWorkspace();
    registerCommands();
    await this.loadWorkingState();
  }

  async wiring() {
    await getCurrentWindow().onCloseRequested(async () => {
      await this.ensureSave();
    });

    window.addEventListener("resize", () => {
      this.editor.fit();
    });

    // update ui states
    useSettingStore.subscribe(() => {
      try {
        window.app.updateUI();
      } catch (err) {
        console.error("Failed to update UI state:", err);
      }
    });
  }

  async setupNativeUI() {
    const appWindow = getCurrentWindow();

    // set initial theme
    const darkMode = useSettingStore.getState().darkMode;
    await appWindow.setTheme(darkMode ? "dark" : "light");

    // setup native menu for macOS
    const aboutSubmenu = await Submenu.new({
      text: "About",
      items: [
        await MenuItem.new({
          id: "quit",
          text: "Quit",
          accelerator: "CmdOrCtrl+Q",
          action: () => {
            window.app.commands.execute("file:quit");
          },
        }),
      ],
    });
    const menu = await Menu.new({ items: [aboutSubmenu] });
    await menu.setAsAppMenu();

    // setup window drag area
    const dragRegions = document.querySelectorAll(
      "[data-manual-window-drag-region]"
    );
    dragRegions.forEach((region) => {
      region.addEventListener("mousedown", (e) => {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.buttons === 1) {
          mouseEvent.detail === 2
            ? appWindow.toggleMaximize() // maximize on double click
            : appWindow.startDragging(); // else start dragging
        }
      });
    });
  }

  async loadFonts() {
    try {
      insertFontsToDocument(fontJson as Font[]);
      await useFontStore.getState().fetchFonts(fontJson as Font[]);
    } catch (err) {
      console.error("Failed to load fonts", err);
    }
  }

  loadKeymap() {
    try {
      this.keymaps.add(keymapJson);
      this.keymaps.htmlReady();
      useKeymapStore
        .getState()
        .setFormattedKeys(this.keymaps.getAllFormattedKeyByCommand());
    } catch (err) {
      console.error("Failed to load keymaps", err);
    }
  }

  loadMenus() {
    try {
      useMenuStore
        .getState()
        .setMenus(
          menuJson as any,
          window.app.keymaps.getAllFormattedKeyByCommand()
        );
    } catch (err) {
      console.error("Failed to load menus", err);
    }
  }

  loadWorkspace() {
    try {
      useExplorerStore.getState().initialize();
    } catch (err) {
      console.error("Failed to load workspace", err);
    }
  }

  async loadWorkingState() {
    try {
      const workspace = window.api.workspace;
      const workingFile = useWorkingStore.getState().workingFile;
      if (workingFile && (await workspace.existsFile(workingFile))) {
        setTimeout(async () => {
          await this.commands.execute("file:open", { filePath: workingFile });
        }, 0);
      } else {
        // TODO: 1. Find the last opened file from recent files
        // TODO: 2. If not found, find the most recently modified file from workspace
        // TODO: 3. If not found, just create a new file in 'Drafts' folder
        console.log("No working file to restore");
      }
    } catch (err) {
      console.error("Failed to load working state", err);
    }
  }

  async ensureSave() {
    await this.commands.execute("file:save");
  }

  updateUI() {
    try {
      const app = window.app;
      const state = useSettingStore.getState();
      const { darkMode } = useSettingStore.getState();
      const menuStates: Record<string, MenuItemState> = {
        "page.delete": { enabled: app.editor.getPages().length > 1 },
        "page.previous": {
          enabled:
            app.editor.getPages().indexOf(app.editor.getCurrentPage()!) > 0,
        },
        "page.next": {
          enabled:
            app.editor.getPages().indexOf(app.editor.getCurrentPage()!) <
            app.editor.getPages().length - 1,
        },
        "edit.undo": { enabled: app.editor.transform.canUndo() },
        "edit.redo": { enabled: app.editor.transform.canRedo() },
        "edit.copy": { enabled: app.editor.selection.size() > 0 },
        "edit.cut": { enabled: app.editor.selection.size() > 0 },
        "edit.paste": { enabled: true /* app.editor.clipboard.hasObjects() */ },
        "edit.duplicate": { enabled: app.editor.selection.size() > 0 },
        "edit.delete": { enabled: app.editor.selection.size() > 0 },
        "shape.group": { enabled: app.editor.selection.size() > 1 },
        "shape.ungroup": {
          enabled: app.editor.selection
            .getShapes()
            .some((s) => s instanceof Group),
        },
        "shape.lock": {
          enabled: app.editor.selection.size() > 0,
          checked:
            app.editor.selection.size() > 0 &&
            app.editor.selection.getShapes().every((s) => !s.enable),
        },
        "shape.hide": {
          enabled: app.editor.selection.size() > 0,
          checked:
            app.editor.selection.size() > 0 &&
            app.editor.selection.getShapes().every((s) => !s.visible),
        },
        "shape.container": {
          enabled: app.editor.selection.size() > 0,
          checked:
            app.editor.selection.size() > 0 &&
            app.editor.selection.getShapes().every((s) => s.containable),
        },
        "view.show-grid": { checked: state.showGrid },
        "view.dark-mode": { checked: darkMode },
        "view.snap-to-grid": { checked: state.snapToGrid },
        "view.snap-to-objects": { checked: state.snapToObjects },
      };
      for (const id in menuStates) {
        useMenuStore.getState().updateStates(id, menuStates[id]);
      }

      // update editor states
      app.editor.setShowGrid(state.showGrid);
      app.editor.setSnapToGrid(state.snapToGrid);
      app.editor.setSnapToObjects(state.snapToObjects);
      app.editor.repaint();
    } catch (err) {
      console.error("Failed to update UI state:", err);
    }
  }
}
