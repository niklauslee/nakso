import { FileEntry } from "@/api/workspace";
import { cn } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, shapeInstantiator, Store } from "@dgmjs/core";
import { DGMPageView, DGMPageViewHandle } from "@dgmjs/react";
import { useEffect, useRef, useState } from "react";

async function load(path: string): Promise<Page | null> {
  const workspace = window.api.workspace;
  const data = await workspace.readFile(path);
  const json = JSON.parse(data);
  const store = new Store(shapeInstantiator);
  store.fromJSON(json);
  const doc = store.root as Doc;
  if (doc.children.length > 0 && doc.children[0] instanceof Page) {
    return doc.children[0] as Page;
  }
  return null;
}

interface FileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  file: FileEntry;
}

export function FileCard({ file, className }: FileCardProps) {
  const pageViewRef = useRef<DGMPageViewHandle>(null);
  const darkMode = useSettingStore((state) => state.darkMode);
  const [page, setPage] = useState<Page | null>(null);

  const fetchFile = async () => {
    try {
      const page = await load(file.fullPath);
      setPage(page);
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [file.fullPath]);

  const handleDoubleClick = () => {
    console.log("double click", file.fullPath);
    window.app.commands.execute("file:open", { filePath: file.fullPath });
  };

  return (
    <div className="w-48 h-fit rounded-xl">
      <div
        className="w-48 h-40 flex items-center justify-center border rounded-xl"
        onDoubleClick={handleDoubleClick}
      >
        {page && (
          <DGMPageView
            ref={pageViewRef}
            className={cn("w-full", className)}
            darkMode={darkMode}
            page={page}
            scaleAdjust={page.size ? 1 : 0.9}
            onClick={() => {
              pageViewRef.current?.focus();
            }}
            tabIndex={0}
          />
        )}
      </div>
      <div className="w-full h-8 flex items-center text-muted-foreground text-sm">
        {file.name}
      </div>
    </div>
  );
}
