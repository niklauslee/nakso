// import { invoke } from "@tauri-apps/api/core";
import "../globals.css";
import { Layout } from "./layout";
import { AppContext } from "@/app-context";
import { apiContext } from "@/api";
import { useAppStore } from "@/store/app-store";
import { Editor as EditorType } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";
import { useEffect } from "react";
import { AppSidebar } from "./sidebar";
import { EditorView } from "./editor-view";
import { SearchView } from "./search-view";
import { cn } from "@/lib/utils";

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
      sidebar={<AppSidebar />}
      showSidebar={showSidebar}
      onContentResize={() => {
        setTimeout(() => window.app?.editor.fit());
      }}
    >
      <EditorView
        onMount={handleAppReady}
        className={cn(view !== "editor" && "hidden")}
      />
      <SearchView className={cn(view !== "search" && "hidden")} />
    </Layout>
  );
}

export default App;
