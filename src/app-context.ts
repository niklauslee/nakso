import { Editor, Group, Mirror } from "@dgmjs/core";
import { CommandManager } from "@/engine/command-manager";
import { KeymapManager } from "@/engine/keymap-manager";
import { Font, insertFontsToDocument, useFontStore } from "@/store/font-store";
import { registerCommands } from "./commands";
import { useSettingStore } from "@/store/setting-store";
import { useKeymapStore } from "@/store/keymap-store";
import packageJson from "../package.json";
import fontJson from "./fonts.json";
import menuJson from "./menu.json";
import keymapJson from "./keymap.json";
import { MenuItemState, useMenuStore } from "@/store/menu-store";
import { useWorkspaceStore } from "./store/workspace-store";
import { AutoSaver } from "./engine/auto-saver";
import { getCurrentWindow } from "@tauri-apps/api/window";

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
      await this.commands.execute("file:save");
    });
  }

  async initialize() {
    await getCurrentWindow().onCloseRequested(async () => {
      await this.ensureSave();
    });
    window.addEventListener("resize", () => {
      this.editor.fit();
    });
    this.wiring();
    await this.loadConfig();
    await this.loadFonts();
    this.loadKeymap();
    this.loadMenus();
    this.loadWorkspace();
    registerCommands();
  }

  wiring() {
    this.editor.onDblClick.addListener(({ shape }) => {
      try {
        if (shape instanceof Mirror) {
          const subject = shape.subject;
          if (subject) {
            const page = subject.getPage();
            if (page) {
              this.editor.setCurrentPage(page);
              const cp = subject.getCenter();
              this.editor.scrollCenterTo(cp);
            }
          }
        }
      } catch (err) {
        console.error("Failed to handle double click:", err);
      }
    });

    this.editor.transform.onAction.addListener(() => {
      try {
        // this.autoSaver.tick();
      } catch (err) {
        console.error("Failed to handle action:", err);
      }
    });

    this.editor.transform.onUndo.addListener(() => {
      // this.autoSaver.tick();
    });

    this.editor.transform.onRedo.addListener(() => {
      // this.autoSaver.tick();
    });

    // update ui states
    useSettingStore.subscribe(() => {
      try {
        window.app.updateUIState();
      } catch (err) {
        console.error("Failed to update UI state:", err);
      }
    });

    // window.api.window.setDarkMode(useSettingStore.getState().darkMode);
  }

  async loadConfig() {
    try {
      // useConfigStore.getState().fetchConfig();
    } catch (err) {
      console.error("Failed to load config", err);
    }
  }

  async loadFonts() {
    try {
      insertFontsToDocument(fontJson as Font[]);
      await useFontStore.getState().fetchFonts(fontJson as Font[]);
      // const systemFonts = await window.api.font.getSystemFonts();
      // useFontStore.getState().addFonts(systemFonts);
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
      useWorkspaceStore.getState().initialize();
    } catch (err) {
      console.error("Failed to load workspace", err);
    }
  }

  async ensureSave() {
    await this.commands.execute("file:save");
  }

  updateUIState() {
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
