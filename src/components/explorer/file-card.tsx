import { FileEntry, workspace } from "@/api/workspace";
import { cn, dateFromNow } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, shapeInstantiator, Store } from "@dgmjs/core";
import { DGMPageView, DGMPageViewHandle } from "@dgmjs/react";
import { BanIcon, HeartIcon, LockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EditableText,
  EditableTextHandle,
} from "@/components/common/editable-text";
import { Button } from "../ui/button";

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
  fileEntry: FileEntry;
  selected?: boolean;
  disabled?: boolean;
}

export function FileCard({
  fileEntry,
  selected = false,
  disabled = false,
  className,
  ...others
}: FileCardProps) {
  const pageViewRef = useRef<DGMPageViewHandle>(null);
  const editableTextRef = useRef<EditableTextHandle>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [broken, setBroken] = useState(false);

  const darkMode = useSettingStore((state) => state.darkMode);
  const favorites = useFavoritesStore((state) => state.files);
  const isFavorite = favorites.includes(fileEntry.fullPath);

  const fetchFile = async () => {
    try {
      const page = await load(fileEntry.fullPath);
      setPage(page);
      if (!(page instanceof Page)) setBroken(true);
    } catch (error) {
      setBroken(true);
      console.error("Failed to load file:", fileEntry.fullPath, error);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [fileEntry.fullPath, fileEntry.mtime, fileEntry.size]);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await window.app.commands.execute("file:remove-from-favorites", {
        filePath: fileEntry.fullPath,
      });
    } else {
      await window.app.commands.execute("file:add-to-favorites", {
        filePath: fileEntry.fullPath,
      });
    }
  };

  const handleFileRename = async (newName: string) => {
    await window.app.commands.execute("file:rename", {
      filePath: fileEntry.fullPath,
      newName,
    });
  };

  const handleDoubleClick = async () => {
    try {
      if (disabled) return;
      if (broken) return;
      await window.app.commands.execute("file:open", {
        filePath: fileEntry.fullPath,
      });
    } catch (err) {
      toast.error("Failed to open file");
      console.error("Failed to open file:", err);
    }
  };

  return (
    <div
      data-id={fileEntry.fullPath}
      className={cn(
        "file-card group relative border border-border/75 hover:border-accent-foreground/25 w-full rounded-lg overflow-clip",
        selected && "ring-2 ring-accent-foreground/25"
      )}
      {...others}
    >
      <div className="" onDoubleClick={handleDoubleClick}>
        {page && !broken && (
          <div
            className={cn(
              "w-full aspect-4/3 flex items-center justify-center bg-background",
              (disabled || fileEntry.readonly) && "opacity-50"
            )}
          >
            <DGMPageView
              ref={pageViewRef}
              className={cn("w-full", className)}
              darkMode={darkMode}
              page={page}
              scaleAdjust={page.size ? 1 : 0.8}
              onClick={() => {
                pageViewRef.current?.focus();
              }}
              tabIndex={0}
              update={true}
            />
          </div>
        )}
        {broken && (
          <div className="w-full aspect-4/3 flex items-center justify-center bg-sidebar text-muted-foreground/50">
            <BanIcon size={32} strokeWidth={1.5} />
          </div>
        )}
        {!page && !broken && (
          <div className="w-full aspect-4/3 flex items-center justify-center bg-sidebar animate-pulse" />
        )}
      </div>
      <div className="flex flex-col w-full max-w-full text-sm py-2 bg-sidebar">
        <div className="relative flex items-center justify-between px-3 w-full max-w-full">
          <div
            className={cn(
              "flex items-center gap-1 min-h-6 w-full max-w-full",
              (disabled || fileEntry.readonly) && "opacity-50"
            )}
          >
            {fileEntry.readonly && <LockIcon size={12} strokeWidth={2.4} />}
            <EditableText
              editable={!disabled}
              ref={editableTextRef}
              className={cn(
                "file-card-name text-sm text-accent-foreground truncate max-w-full"
              )}
              value={fileEntry.name}
              onValueChange={handleFileRename}
            />
          </div>
        </div>
        <div className="flex items-center text-nowrap text-xs text-muted-foreground/75 px-3">
          {dateFromNow(new Date(fileEntry.mtime!))}
        </div>
      </div>
      <div className="absolute right-0 top-0 p-1">
        {!broken && !disabled && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            className={cn(
              !isFavorite &&
                "opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100"
            )}
          >
            <HeartIcon
              size={16}
              className={"text-foreground cursor-pointer"}
              fill={isFavorite ? "currentColor" : "transparent"}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
