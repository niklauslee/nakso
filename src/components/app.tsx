// import { invoke } from "@tauri-apps/api/core";
import "../globals.css";
import { AppContext } from "@/app-context";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { EditorView } from "./editor/editor-view";
import { FolderView } from "./explorer/folder-view";
import { Toaster } from "@/components/ui/sonner";
import { useWorkingStore } from "@/store/working-store";
import { RecentsView } from "./explorer/recents-view";
import { apiContext } from "@/api";
import { FavoritesView } from "./explorer/favorites-view";

declare global {
  interface Window {
    app: AppContext;
    api: typeof apiContext;
  }
}

function App() {
  const setAppReady = useAppStore((state) => state.setAppReady);
  const view = useAppStore((state) => state.view);
  const showSidebar = useSettingStore((state) => state.showSidebar);
  const darkMode = useSettingStore((state) => state.darkMode);
  const workingFolder = useWorkingStore((state) => state.workingFolder);
  const setWorkingFolder = useWorkingStore((state) => state.setWorkingFolder);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleAppReady = async (editor: EditorType) => {
    try {
      window.app = new AppContext(editor);
      window.api = apiContext;
      await window.app.initialize();

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
            <EditorView
              onMount={handleAppReady}
              className={cn(view !== "editor" && "hidden")}
            />
            <RecentsView className={cn(view !== "recents" && "hidden")} />
            <FavoritesView className={cn(view !== "favorites" && "hidden")} />
            <FolderView
              path={workingFolder}
              className={cn(view !== "folder" && "hidden")}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
