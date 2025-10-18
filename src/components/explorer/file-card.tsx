import { FileEntry, workspace } from "@/api/workspace";
import { cn, dateFromNow } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, shapeInstantiator, Store } from "@dgmjs/core";
import { DGMPageView, DGMPageViewHandle } from "@dgmjs/react";
import { BanIcon, EllipsisIcon, HeartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EditableText } from "@/components/common/editable-text";

async function load(path: string): Promise<Page | null> {
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
  const [page, setPage] = useState<Page | null>(null);
  const [broken, setBroken] = useState(false);

  const darkMode = useSettingStore((state) => state.darkMode);
  const favorites = useFavoritesStore((state) => state.files);
  const addToFavorites = useFavoritesStore((state) => state.addToFavorites);
  const removeFromFavorites = useFavoritesStore(
    (state) => state.removeFromFavorites
  );
  const isFavorite = favorites.includes(file.fullPath);

  const fetchFile = async () => {
    try {
      const page = await load(file.fullPath);
      setPage(page);
    } catch (error) {
      setBroken(true);
      console.error("Failed to load file:", error);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [file.fullPath, file.mtime, file.size]);

  const handleDoubleClick = () => {
    try {
      if (broken) return;
      window.app.commands.execute("file:open", { filePath: file.fullPath });
    } catch (err) {
      toast.error("Failed to open file");
      console.error("Failed to open file:", err);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(file.fullPath);
    } else {
      addToFavorites(file.fullPath);
    }
  };

  return (
    <div className="relative w-52 h-fit border rounded-xl overflow-clip group">
      <div className="w-52 h-36" onDoubleClick={handleDoubleClick}>
        {page && !broken && (
          <div className="w-full h-full flex items-center justify-center p-2">
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
          </div>
        )}
        {broken && (
          <div className="w-full h-full flex items-center justify-center bg-accent/50 text-accent-foreground/20">
            <BanIcon size={32} strokeWidth={1} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full text-sm py-2 bg-accent">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center">
            <EditableText
              className="text-sm text-accent-foreground truncate max-w-full"
              value={file.name}
              onValueChange={(value) => {
                console.log("file name changed", value);
              }}
            />
          </div>
          <div>
            <button className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 cursor-pointer">
              <EllipsisIcon size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center text-nowrap text-xs text-muted-foreground px-2">
          {dateFromNow(new Date(file.mtime!))}
        </div>
      </div>

      <div className="absolute right-0 top-0 p-2">
        <button
          type="button"
          onClick={handleToggleFavorite}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          className={cn(
            !isFavorite &&
              "opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100"
          )}
        >
          <HeartIcon
            size={16}
            className={"text-muted-foreground cursor-pointer"}
            fill={isFavorite ? "currentColor" : "transparent"}
          />
        </button>
      </div>
    </div>
  );
}
