import { useExplorerStore } from "@/store/explorer-store";
import { FileEntryTree } from "./file-entry-tree";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuPositioner,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useState } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import { DRAFTS_TAG } from "@/const";

export function FolderTreeView() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const setView = useExplorerStore((state) => state.setView);
  const folders = useExplorerStore((state) => state.folders);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const focusedFolder = folders.find((f) => f.fullPath === focusedId);
  const isDraftsFolderFocused = focusedFolder?.tag === DRAFTS_TAG;

  console.log("isDraftsFolderFocused", isDraftsFolderFocused);

  const handleOpenChange = (open: boolean, eventDetails: any) => {
    if (open) {
      const target = (eventDetails.event.target as any).closest(
        ".file-entry-tree-node"
      );
      if (target) {
        const id = target.dataset.id;
        setFocusedId(id);
      }
    } else {
      setFocusedId(null);
    }
  };

  const handleNameChange = async (folder: any, text: string) => {
    const result = await confirm(
      `Rename folder "${folder.name}" to "${text}"?`,
      {
        title: "Rename Folder",
      }
    );
    if (result) {
      await window.app.commands.execute("file:rename-folder", {
        dirPath: folder.fullPath,
        newName: text,
      });
    }
  };

  const handleRename = () => {
    if (focusedId) {
      const node = document.querySelector(
        `.file-entry-tree-node[data-id="${focusedId}"]`
      ) as HTMLElement;
      if (node) {
        const nameNode = node.querySelector(".file-entry-tree-node-item-name");
        if (nameNode) {
          nameNode.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        }
      }
    }
  };

  const handleDelete = async () => {
    if (!focusedFolder) return;
    const result = await confirm(
      `Delete folder "${focusedFolder?.name}" permanently?`,
      {
        title: "Delete Folder",
      }
    );
    if (result) {
      await window.app.commands.execute("file:delete-folder", {
        dirPath: focusedFolder?.fullPath,
      });
    }
  };

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger>
        <FileEntryTree
          fileEntries={folders}
          selectedId={currentFolder?.fullPath ?? null}
          focusedId={focusedId}
          onFileEntrySelect={(folder) => {
            setCurrentFolder(folder);
            setView("folder");
          }}
          onNameChange={handleNameChange}
        />
      </ContextMenuTrigger>
      <ContextMenuPositioner>
        <ContextMenuContent className="w-32 p-1.5 shadow-lg focus:outline-none">
          <ContextMenuItem
            className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
            disabled={isDraftsFolderFocused}
            onClick={(e) => {
              console.log("new folder", currentFolder);
            }}
          >
            New Folder
          </ContextMenuItem>
          <ContextMenuItem
            className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
            disabled={isDraftsFolderFocused}
            onClick={handleRename}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator className="my-1.5" />
          <ContextMenuItem
            className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
            disabled={isDraftsFolderFocused}
            onClick={handleDelete}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPositioner>
    </ContextMenu>
  );
}
