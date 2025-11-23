import { FileEntry, workspace } from "@/api/workspace";
import { cn, dateFromNow } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSettingStore } from "@/store/setting-store";
import { Doc, Page, shapeInstantiator, Store } from "@dgmjs/core";
import { DGMPageView, DGMPageViewHandle } from "@dgmjs/react";
import { BanIcon, EllipsisIcon, HeartIcon, LockIcon } from "lucide-react";
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
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExplorerStore } from "@/store/explorer-store";
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
  file: FileEntry;
  selected?: boolean;
}

export function FileCard({
  file,
  selected = false,
  className,
  ...others
}: FileCardProps) {
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
      if (!(page instanceof Page)) setBroken(true);
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
    await window.app.commands.execute("file:rename", {
      filePath: file.fullPath,
      newName,
    });
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
    console.log("Rename clicked");
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
    <div
      className={cn(
        "group relative border border-border/65 w-full rounded-lg overflow-clip",
        selected && "ring-2 ring-primary/75"
      )}
      {...others}
    >
      <div className="" onDoubleClick={handleOpenClick}>
        {page && !broken && (
          <div className="w-full aspect-4/3 flex items-center justify-center">
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
      </div>
      <div className="flex flex-col w-full max-w-full text-sm py-2 bg-sidebar">
        <div className="relative flex items-center justify-between px-3 w-full max-w-full">
          <div
            className={cn(
              "flex items-center gap-1 min-h-6 w-full max-w-full",
              file.readonly && "opacity-50"
            )}
          >
            {file.readonly && <LockIcon size={16} />}
            <EditableText
              ref={editableTextRef}
              className="text-sm text-accent-foreground truncate max-w-full"
              value={file.name}
              onValueChange={handleFileRename}
            />
          </div>
          <div className="absolute right-0 top-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon-sm" variant="ghost" />}
              >
                <EllipsisIcon size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuPositioner align="end">
                <DropdownMenuContent className="w-fit p-1.5 shadow-lg">
                  <DropdownMenuItem
                    className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
                    onClick={handleOpenClick}
                  >
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
                    onClick={handleRenameClick}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
                    onClick={handleDuplicateClick}
                  >
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
                    onClick={handleMoveToTrashClick}
                  >
                    Move to Trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPositioner>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center text-nowrap text-xs text-muted-foreground/75 px-3">
          {dateFromNow(new Date(file.mtime!))}
        </div>
      </div>

      <div className="absolute right-0 top-0 p-2">
        {!broken && (
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
