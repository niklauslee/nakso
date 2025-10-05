import { Editor, Mirror } from "@dgmjs/core";
import { CommandManager } from "./engine/command-manager";
import { KeymapManager } from "./engine/keymap-manager";
import { Font, insertFontsToDocument, useFontStore } from "./store/font-store";
import { registerCommands } from "./commands";
// import { MenuItemState, useMenuStore } from "./store/menu-store";
// import { useDocStore } from "./store/doc-store";
// import { useSettingStore } from "./store/setting-store";
import { useKeymapStore } from "./store/keymap-store";
import packageJson from "../package.json";
import fontJson from "./fonts.json";
// import menuJson from "./menu.json";
import keymapJson from "./keymap.json";
// import { useLibraryStore } from "./store/library-store";
// import { useConfigStore } from "./store/config-store";
import { toast } from "sonner";

export class AppContext {
  productName: string;
  productId: string;
  version: string;
  platform: string;
  editor: Editor;
  commands: CommandManager;
  keymaps: KeymapManager;

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
  }

  async initialize() {
    window.addEventListener("resize", () => {
      this.editor.fit();
    });
    this.wiring();
    await this.loadConfig();
    await this.loadFonts();
    this.loadKeymap();
    this.loadMenus();
    registerCommands();
  }

  wiring() {
    // draw boundary of shapes having link
    // this.editor.onRepaint.addListener(() => {
    //   try {
    //     if (useSettingStore.getState().showLinks) {
    //       const canvas = this.editor.canvas;
    //       const page: Page | null = this.editor.getCurrentPage();
    //       const thickness = canvas.px * 4;
    //       canvas.storeState();
    //       canvas.strokeColor = "$blue9";
    //       canvas.strokeWidth = thickness;
    //       canvas.strokePattern = [];
    //       canvas.roughness = 0;
    //       canvas.alpha = 0.5;
    //       page?.traverse((shape) => {
    //         if (
    //           shape instanceof Shape &&
    //           (shape.reference instanceof Page || shape.link.length > 0)
    //         ) {
    //           const rect = geometry.expandRect(
    //             shape
    //               .getBoundingRect()
    //               .map((p) => utils.lcs2ccs(canvas, shape, p)),
    //             shape.strokeWidth + thickness / 2
    //           );
    //           canvas.strokeRect(rect[0][0], rect[0][1], rect[1][0], rect[1][1]);
    //         }
    //       });
    //       canvas.restoreState();
    //     }
    //   } catch (err) {
    //     console.error("Failed to draw links:", err);
    //   }
    // });

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

    this.editor.transform.onAction.addListener((action) => {
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

    // synchronize window state between renderers and main process
    // useDocStore.subscribe((state, prevState) => {
    //   try {
    //     if (state.filePath !== prevState.filePath) {
    //       window.api.window.setFilePath(state.filePath);
    //     }
    //     if (state.modified !== prevState.modified) {
    //       window.api.window.setModified(state.modified);
    //     }
    //   } catch (err) {
    //     console.error("Failed to synchronize window state:", err);
    //   }
    // });

    // update ui states
    // useSettingStore.subscribe((state, prevState) => {
    //   try {
    //     window.app.updateUIState();
    //     if (state.darkMode !== prevState.darkMode) {
    //       window.api.window.setDarkMode(state.darkMode);
    //     }
    //     this.autoSaver.tick();
    //   } catch (err) {
    //     console.error("Failed to update UI state:", err);
    //   }
    // });

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
      // useMenuStore
      //   .getState()
      //   .setMenus(
      //     menuJson as any,
      //     window.app.keymaps.getAllFormattedKeyByCommand()
      //   );
    } catch (err) {
      console.error("Failed to load menus", err);
    }
  }

  async openDoc(filePath: string) {
    try {
      // const data = await window.api.fs.read(filePath);
      // const json = JSON.parse(data);
      // this.editor.loadFromJSON(json);
      // useDocStore.getState().setFilePath(filePath);
      // useDocStore.getState().setModified(false);
      // useDocStore.getState().setDoc(this.editor.getDoc());
    } catch (err) {
      toast.error("Failed to open file: " + filePath);
      console.error("Failed to open file: " + filePath, err);
      this.editor.newDoc();
      // useDocStore.getState().setFilePath(null);
      // useDocStore.getState().setModified(false);
      // useDocStore.getState().setDoc(this.editor.getDoc());
      // useSettingStore.getState().removeOpenRecent(filePath);
    }
  }

  async newDoc() {
    try {
      this.editor.newDoc();
      // useDocStore.getState().setDoc(this.editor.getDoc());
    } catch (err) {
      toast.error("Failed to create a new document");
      console.error(err);
    }
  }

  // updateUIState() {
  //   try {
  //     const app = window.app;
  //     const state = useSettingStore.getState();
  //     const { darkMode } = useSettingStore.getState();
  //     const menuStates: Record<string, MenuItemState> = {
  //       "page.delete": { enabled: app.editor.getPages().length > 1 },
  //       "page.previous": {
  //         enabled:
  //           app.editor.getPages().indexOf(app.editor.getCurrentPage()!) > 0,
  //       },
  //       "page.next": {
  //         enabled:
  //           app.editor.getPages().indexOf(app.editor.getCurrentPage()!) <
  //           app.editor.getPages().length - 1,
  //       },
  //       "edit.undo": { enabled: app.editor.transform.canUndo() },
  //       "edit.redo": { enabled: app.editor.transform.canRedo() },
  //       "edit.copy": { enabled: app.editor.selection.size() > 0 },
  //       "edit.cut": { enabled: app.editor.selection.size() > 0 },
  //       "edit.paste": { enabled: true /* app.editor.clipboard.hasObjects() */ },
  //       "edit.duplicate": { enabled: app.editor.selection.size() > 0 },
  //       "edit.delete": { enabled: app.editor.selection.size() > 0 },
  //       "shape.group": { enabled: app.editor.selection.size() > 1 },
  //       "shape.ungroup": {
  //         enabled: app.editor.selection
  //           .getShapes()
  //           .some((s) => s instanceof Group),
  //       },
  //       "shape.lock": {
  //         enabled: app.editor.selection.size() > 0,
  //         checked:
  //           app.editor.selection.size() > 0 &&
  //           app.editor.selection.getShapes().every((s) => !s.enable),
  //       },
  //       "shape.hide": {
  //         enabled: app.editor.selection.size() > 0,
  //         checked:
  //           app.editor.selection.size() > 0 &&
  //           app.editor.selection.getShapes().every((s) => !s.visible),
  //       },
  //       "shape.container": {
  //         enabled: app.editor.selection.size() > 0,
  //         checked:
  //           app.editor.selection.size() > 0 &&
  //           app.editor.selection.getShapes().every((s) => s.containable),
  //       },
  //       "view.show-links": { checked: state.showLinks },
  //       "view.show-grid": { checked: state.showGrid },
  //       "view.dark-mode": { checked: darkMode },
  //       "view.toggle-navigator": { checked: state.showNavigator },
  //       "view.toggle-inspector": { checked: state.showInspector },
  //       "view.snap-to-grid": { checked: state.snapToGrid },
  //       "view.snap-to-objects": { checked: state.snapToObjects },
  //     };
  //     for (const id in menuStates) {
  //       useMenuStore.getState().updateStates(id, menuStates[id]);
  //     }

  //     // update open recent menu
  //     const openRecent = useSettingStore.getState().openRecent;
  //     useMenuStore.getState().setOpenRecent(openRecent);

  //     // update editor states
  //     app.editor.setShowGrid(state.showGrid);
  //     app.editor.setSnapToGrid(state.snapToGrid);
  //     app.editor.setSnapToObjects(state.snapToObjects);
  //     app.editor.repaint();
  //   } catch (err) {
  //     console.error("Failed to update UI state:", err);
  //   }
  // }
}
