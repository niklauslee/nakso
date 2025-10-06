// import { invoke } from "@tauri-apps/api/core";
import { Layout } from "./layout";
import Editor from "./editor";
import "../globals.css";
import { AppContext } from "@/app-context";
import { apiContext } from "@/api";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { EllipsisVerticalIcon, PanelLeftIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSettingStore } from "@/store/setting-store";
import { Toolbar } from "./toolbar";
import { Palette } from "./palette";
import { useEffect } from "react";
import { ApplicationContextMenu } from "@/components/menu/context-menu";
import { useMenuStore } from "@/store/menu-store";
import { ApplicationMenu } from "./menu/menu";
import { AppSidebar } from "./sidebar";

declare global {
  interface Window {
    app: AppContext;
    api: typeof apiContext;
  }
}

function App() {
  const setAppReady = useAppStore((state) => state.setAppReady);
  const showSidebar = useSettingStore((state) => state.showSidebar);
  const darkMode = useSettingStore((state) => state.darkMode);
  const menuStore = useMenuStore();

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

      window.app.updateUIState();
      setAppReady(true, editor.platform);
    } catch (error) {
      console.error("Failed to initialize the app:", error);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center justify-between w-full text-sm font-medium">
          <div className="flex items-center gap-1">
            <Button
              className="size-7 pointer-events-auto"
              variant="ghost"
              size="icon"
              onClick={() =>
                window.app?.commands.execute("view:toggle-sidebar")
              }
            >
              <PanelLeftIcon size={16} />
            </Button>
            header
          </div>
          <div className="">
            <ApplicationMenu menu={menuStore.menus.main} className="w-36">
              <Button
                className="size-7 pointer-events-auto"
                variant="ghost"
                size="icon"
              >
                <EllipsisVerticalIcon size={16} />
              </Button>
            </ApplicationMenu>
          </div>
        </div>
      }
      sidebar={<AppSidebar />}
      showSidebar={showSidebar}
      onContentResize={() => {
        setTimeout(() => window.app?.editor.fit());
      }}
    >
      <ApplicationContextMenu menu={menuStore.menus.context} className="w-44">
        <Editor onMount={handleAppReady} />
      </ApplicationContextMenu>
      <Toolbar />
      <Palette />
    </Layout>
  );
}

export default App;
