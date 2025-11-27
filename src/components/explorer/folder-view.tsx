import { FileCard } from "./file-card";
import { useExplorerStore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileEntry } from "@/api/workspace";
import { cn } from "@/lib/utils";
import { TRASH_TAG } from "@/const";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuPositioner,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { is } from "zod/v4/locales";
import { confirm } from "@tauri-apps/plugin-dialog";

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  folder: FileEntry | null;
}

export function FolderView({ folder, className, ...others }: FolderViewProps) {
  if (!folder) return;

  const [selection, setSelection] = useState<string[]>([]);
  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const fetchMoreFiles = useExplorerStore((state) => state.fetchMoreFiles);
  const isTrashFolder = folder.tag === TRASH_TAG;
  const selectedId = selection.length === 1 ? selection[0] : null;

  const select = (id: string, addToSelection: boolean) => {
    if (addToSelection) {
      setSelection((prev) => {
        if (prev.includes(id)) {
          return prev.filter((selectedId) => selectedId !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      setSelection([id]);
    }
  };

  const handleScrollViewPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;
    const target = (e.target as any).closest(".file-card");
    if (target) {
      const id = target.dataset.id;
      if (selection.includes(id)) return;
      select(id, e.shiftKey);
    } else {
      setSelection([]);
    }
  };

  const handleOpenChange = (open: boolean, eventDetails: any) => {
    if (open) {
      const pointerEvent = eventDetails.event as PointerEvent;
      const target = (eventDetails.event.target as any).closest(".file-card");
      if (target) {
        const id = target.dataset.id;
        if (selection.includes(id)) return;
        select(id, pointerEvent.shiftKey);
      } else {
        setSelection([]);
      }
    }
  };

  const handleOpen = async () => {
    try {
      if (selectedId) {
        await window.app.commands.execute("file:open", {
          filePath: selectedId,
        });
      }
    } catch (err) {
      toast.error("Failed to open file");
      console.error("Failed to open file:", err);
    }
  };

  const handleRename = async () => {
    try {
      if (selectedId) {
        const node = document.querySelector(
          `.file-card[data-id="${selectedId}"]`
        ) as HTMLElement;
        if (node) {
          const nameNode = node.querySelector(".file-card-name");
          if (nameNode) {
            nameNode.dispatchEvent(
              new MouseEvent("dblclick", { bubbles: true })
            );
          }
        }
      }
    } catch (err) {
      toast.error("Failed to rename file");
      console.error("Failed to rename file:", err);
    }
  };

  const handleDuplicate = async () => {
    try {
      if (selectedId) {
        const newPath = await window.app.commands.execute("file:duplicate", {
          filePath: selectedId,
        });
        useExplorerStore.getState().addFile(newPath);
      }
    } catch (err) {
      toast.error("Failed to duplicate files");
      console.error("Failed to duplicate files:", err);
    }
  };

  const handleMoveToTrash = async () => {
    try {
      if (selection.length > 0) {
        await window.app.commands.execute("file:move-to-trash", {
          filePaths: selection,
        });
      }
    } catch (err) {
      toast.error("Failed to move files to trash");
      console.error("Failed to move files to trash:", err);
    }
  };

  const handleRestoreToDrafts = async () => {
    try {
      if (selection.length > 0) {
        await window.app.commands.execute("file:move", {
          filePaths: selection,
          newPath: window.app.getDraftsDir(),
        });
        toast.success(`${selection.length} file(s) restored to Drafts`);
      }
    } catch (err) {
      toast.error("Failed to restore files to drafts");
      console.error("Failed to restore files to drafts:", err);
    }
  };

  const handleDeletePermanently = async () => {
    try {
      if (selection.length > 0) {
        const result = await confirm(`Delete all selected files permanently?`, {
          title: "Delete Permanently",
        });
        if (result) {
          await window.app.commands.execute("file:delete", {
            filePaths: selection,
          });
          toast.success(`${selection.length} file(s) deleted permanently`);
        }
      }
    } catch (err) {
      toast.error("Failed to delete files permanently");
      console.error("Failed to delete files permanently:", err);
    }
  };

  const handleFileCardDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const id = target.dataset.id || "";
    if (id && id.length > 0) {
      if (!selection.includes(id)) select(id, e.shiftKey);
      // create custom drag image
      const customImage = document.createElement("div");
      customImage.innerHTML = `Moving ${selection.length} file(s)`;
      customImage.className =
        "custom-drag-image text-sm bg-background border rounded-lg px-6 py-3 absolute top-0 left-0";
      document.body.appendChild(customImage);
      // set drag image and data
      e.dataTransfer.setDragImage(customImage, 0, 0);
      e.dataTransfer.setData("application/json", JSON.stringify(selection));
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleFileCardDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const customImage = document.querySelector(".custom-drag-image");
    if (customImage) {
      document.body.removeChild(customImage);
    }
  };

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger className="w-full h-full">
        <InfiniteScrollArea
          className={cn("w-full h-full", className)}
          innerClassName="grid gap-4 w-full px-4 pt-1 pb-4 2xs:grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
          count={loadedFiles.length}
          totalCount={files.length}
          fetchFirstDeps={[folder]}
          fetchFirst={async () => {
            await fetchMoreFiles();
          }}
          fetchMore={async () => {
            await fetchMoreFiles();
          }}
          onPointerDown={handleScrollViewPointerDown}
          {...others}
        >
          {loadedFiles.length > 0 && (
            <>
              {loadedFiles.map((file) => (
                <FileCard
                  key={file.fullPath}
                  fileEntry={file}
                  disabled={folder.tag === TRASH_TAG}
                  selected={selection.includes(file.fullPath)}
                  draggable={true}
                  onDragStart={handleFileCardDragStart}
                  onDragEnd={handleFileCardDragEnd}
                />
              ))}
            </>
          )}
          {files.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-sm">
              No files
            </div>
          )}
        </InfiniteScrollArea>
      </ContextMenuTrigger>
      <ContextMenuPositioner>
        <ContextMenuContent className="w-fit p-1.5 shadow-lg focus:outline-none">
          {!isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleOpen}
              disabled={!selectedId || isTrashFolder}
            >
              Open
            </ContextMenuItem>
          )}
          {!isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleRename}
              disabled={!selectedId || isTrashFolder}
            >
              Rename
            </ContextMenuItem>
          )}
          {!isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleDuplicate}
              disabled={!selectedId || isTrashFolder}
            >
              Duplicate
            </ContextMenuItem>
          )}
          {isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleRestoreToDrafts}
              disabled={selection.length === 0}
            >
              Restore to Drafts
            </ContextMenuItem>
          )}
          <ContextMenuSeparator className="my-1.5" />
          {!isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleMoveToTrash}
              disabled={selection.length === 0 || isTrashFolder}
            >
              Move to Trash
            </ContextMenuItem>
          )}
          {isTrashFolder && (
            <ContextMenuItem
              className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
              onClick={handleDeletePermanently}
              disabled={selection.length === 0}
            >
              Delete Permanently
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenuPositioner>
    </ContextMenu>
  );
}
