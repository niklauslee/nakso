// import { invoke } from "@tauri-apps/api/core";
import { Layout } from "./layout";
import Editor from "./editor";
import "../globals.css";
import { AppContext } from "@/app-context";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { PanelLeftIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSettingStore } from "@/store/setting-store";
import { Toolbar } from "./toolbar";
import { Palette } from "./palette";
import { useEffect } from "react";

declare global {
  interface Window {
    app: AppContext;
  }
}

function App() {
  const setAppReady = useAppStore((state) => state.setAppReady);
  const showSidebar = useSettingStore((state) => state.showSidebar);
  const darkMode = useSettingStore((state) => state.darkMode);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleAppReady = async (editor: EditorType) => {
    try {
      window.app = new AppContext(editor);
      await window.app.initialize();

      editor.newDoc();
      editor.fitToScreen();
      window.addEventListener("resize", () => {
        editor.fit();
      });

      setAppReady(true, editor.platform);
    } catch (error) {
      console.error("Failed to initialize the app:", error);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center text-sm font-medium gap-1 pl-1.5">
          <Button
            className="p-0 pointer-events-auto"
            variant="ghost"
            size="icon"
            onClick={() => window.app?.commands.execute("view:toggle-sidebar")}
          >
            <PanelLeftIcon size={16} strokeWidth={1.5} />
          </Button>
          header
        </div>
      }
      sidebarHeader={
        <div className="w-full flex items-center justify-end pr-1.5">
          <Button
            className="pointer-events-auto"
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("add page");
            }}
          >
            <PlusIcon size={16} strokeWidth={1.5} />
          </Button>
        </div>
      }
      sidebar={<div className="w-full h-full px-4">sidebar</div>}
      showSidebar={showSidebar}
      onContentResize={() => {
        setTimeout(() => window.app?.editor.fit());
      }}
    >
      <Editor onMount={handleAppReady} />
      <Toolbar />
      <Palette />
    </Layout>
  );
}

export default App;
