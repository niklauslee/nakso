import { FileEntry, workspace } from "@/api/workspace";
import { cn, dateFromNow } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, shapeInstantiator, Store } from "@dgmjs/core";
import { DGMPageView, DGMPageViewHandle } from "@dgmjs/react";
import { BanIcon, EllipsisIcon, HeartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EditableText,
  EditableTextHandle,
} from "@/components/common/editable-text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EXT_NAME } from "@/const";
import { useExplorerStore } from "@/store/explorer-store";
import { join } from "@tauri-apps/api/path";

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
  const editableTextRef = useRef<EditableTextHandle>(null);
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
      console.error("Failed to load file:", file.fullPath, error);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [file.fullPath, file.mtime, file.size]);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(file.fullPath);
    } else {
      addToFavorites(file.fullPath);
    }
  };

  const handleFileRename = async (newName: string) => {
    try {
      if (newName === file.name) return;
      const oldPath = file.fullPath;
      const { dir: baseDir } = await workspace.parsePath(oldPath);
      const newPath = await join(baseDir, newName + EXT_NAME);
      await window.app.commands.execute("file:rename", {
        oldPath,
        newPath,
      });
    } catch (err) {
      console.error("Failed to rename file:", err);
    }
  };

  const handleOpenClick = async () => {
    try {
      if (broken) return;
      await window.app.commands.execute("file:open", {
        filePath: file.fullPath,
      });
    } catch (err) {
      toast.error("Failed to open file");
      console.error("Failed to open file:", err);
    }
  };

  const handleRenameClick = () => {
    setTimeout(() => {
      editableTextRef.current?.startEdit();
    }, 200);
  };

  const handleDuplicateClick = async () => {
    try {
      const newPath = await window.app.commands.execute("file:duplicate", {
        filePath: file.fullPath,
      });
      useExplorerStore.getState().addFile(newPath);
    } catch (err) {
      console.error("Failed to duplicate file:", err);
    }
  };

  const handleMoveToTrashClick = async () => {
    try {
      await window.app.commands.execute("file:move-to-trash", {
        filePath: file.fullPath,
      });
    } catch (err) {
      console.error("Failed to move file to trash:", err);
    }
  };

  return (
    <div className="relative w-52 h-fit border rounded-xl overflow-clip group">
      <div className="w-52 h-36" onDoubleClick={handleOpenClick}>
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
      <div className="flex flex-col w-full max-w-full text-sm py-2 bg-accent">
        <div className="relative flex items-center justify-between px-2 w-full max-w-full">
          <div className="flex items-center min-h-6 w-full max-w-full">
            <EditableText
              ref={editableTextRef}
              className="text-sm text-accent-foreground truncate max-w-full"
              value={file.name}
              onValueChange={handleFileRename}
            />
          </div>
          <div className="absolute right-0 top-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex bg-accent/90 items-center justify-center text-muted-foreground outline-0 w-4 h-4 cursor-pointer">
                  <EllipsisIcon size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit" align="end">
                <DropdownMenuItem onSelect={handleOpenClick}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleRenameClick}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDuplicateClick}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleToggleFavorite}>
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleMoveToTrashClick}>
                  Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center text-nowrap text-xs text-muted-foreground px-2">
          {dateFromNow(new Date(file.mtime!))}
        </div>
      </div>

      <div className="absolute right-0 top-0 p-2">
        {!broken && (
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
        )}
      </div>
    </div>
  );
}
