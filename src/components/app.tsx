// import { invoke } from "@tauri-apps/api/core";
import "../globals.css";
import { AppContext } from "@/app-context";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";
import { Activity, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { EditorView } from "./editor/editor-view";
import { FolderView } from "./explorer/folder-view";
import { Toaster } from "@/components/ui/sonner";
import { apiContext } from "@/api";
import { useExplorerStore } from "@/store/explorer-store";
import { SettingsDialog } from "./settings/settings-dialog";
import { AboutDialog } from "./dialogs/about-dialog";
import { AppHeader } from "./app-header";
import { cn } from "@/lib/utils";
import { EditorViewHeader } from "./editor/editor-view-header";
import { FolderViewHeader } from "./explorer/folder-view-header";

declare global {
  interface Window {
    app: AppContext;
    api: typeof apiContext;
  }
}

function App() {
  const setAppReady = useAppStore((state) => state.setAppReady);
  const view = useExplorerStore((state) => state.view);
  const showSidebar = useSettingStore((state) => state.showSidebar);
  const darkMode = useSettingStore((state) => state.darkMode);
  const currentFolder = useExplorerStore((state) => state.currentFolder);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleAppReady = async (editor: EditorType) => {
    try {
      await window.app.appReady(editor);
      editor.newDoc();
      editor.fitToScreen();
      window.addEventListener("resize", () => {
        editor.fit();
      });
      window.app.updateUI();
      setAppReady(true, editor.platform);
    } catch (error) {
      console.error("Failed to initialize the app:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 select-none">
        <SidebarProvider open={showSidebar}>
          <AppSidebar />
          <SidebarInset>
            <div className="absolute inset-0">
              <AppHeader>
                <Activity mode={view === "editor" ? "visible" : "hidden"}>
                  <EditorViewHeader />
                </Activity>
                <Activity mode={view === "folder" ? "visible" : "hidden"}>
                  <FolderViewHeader folder={currentFolder} />
                </Activity>
              </AppHeader>
              <article
                className={cn(
                  "absolute top-12 bottom-0 inset-x-0 pointer-events-auto"
                )}
              >
                <Activity mode={view === "editor" ? "visible" : "hidden"}>
                  <EditorView onMount={handleAppReady} />
                </Activity>
                <Activity mode={view === "folder" ? "visible" : "hidden"}>
                  <FolderView folder={currentFolder} />
                </Activity>
              </article>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <AboutDialog />
      <SettingsDialog />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
