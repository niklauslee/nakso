// import { invoke } from "@tauri-apps/api/core";
import "../globals.css";
import { AppContext } from "@/app-context";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";
import { useEffect, useRef } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { EditorView } from "./editor/editor-view";
import { FolderView } from "./explorer/folder-view";
import { Toaster } from "@/components/ui/sonner";
import { apiContext } from "@/api";
import { useExplorerStore } from "@/store/explorer-store";
import { SettingsDialog } from "./settings/settings-dialog";
import { AboutDialog } from "./dialogs/about-dialog";
import { AppHeader } from "./header/app-header";
import { cn } from "@/lib/utils";
import { EditorViewHeader } from "./header/editor-view-header";
import { FolderViewHeader } from "./header/folder-view-header";
import { KeyboardShortcutsDialog } from "./dialogs/keyboard-shorcuts-dialog";

declare global {
  interface Window {
    app: AppContext;
    api: typeof apiContext;
  }
}

function App() {
  const setAppReady = useAppStore((state) => state.setAppReady);
  const view = useExplorerStore((state) => state.view);
  const darkMode = useSettingStore((state) => state.darkMode);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setTimeout(() => window.app?.editor?.fit(), 0);
    });
    if (articleRef.current) {
      observer.observe(articleRef.current);
    }
    return () => observer.disconnect();
  }, [view]);

  const handleAppReady = async (editor: EditorType) => {
    try {
      await window.app.appReady(editor);
      editor.newDoc();
      editor.fitToScreen();
      window.app.updateMenu();
      setAppReady(true);
    } catch (error) {
      console.error("Failed to initialize the app:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 select-none">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="absolute inset-0">
              <header className="absolute top-0 left-0 right-0 h-12">
                <EditorViewHeader
                  className={view === "editor" ? "" : "hidden"}
                />
                <FolderViewHeader
                  folder={currentFolder}
                  className={view === "folder" ? "" : "hidden"}
                />
              </header>
              <article
                ref={articleRef}
                className={cn(
                  "absolute top-12 bottom-0 inset-x-0 pointer-events-auto"
                )}
              >
                <EditorView
                  onMount={handleAppReady}
                  className={view === "editor" ? "" : "hidden"}
                />
                <FolderView
                  folder={currentFolder}
                  className={view === "folder" ? "" : "hidden"}
                />
              </article>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <AboutDialog />
      <SettingsDialog />
      <KeyboardShortcutsDialog />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
