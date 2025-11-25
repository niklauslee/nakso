/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  EllipsisIcon,
  FolderCheckIcon,
  FolderIcon,
} from "lucide-react";
import { FileEntry } from "@/api/workspace";
import { DRAFTS_TAG } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderTreeProps {
  folders: FileEntry[];
  selection: string | null;
  onFolderSelect?: (folder: FileEntry) => void;
}

interface FolderTreeNodeProps extends React.HTMLProps<HTMLLIElement> {
  id: string;
  fileEntry: FileEntry;
  level?: number;
  levelIndent?: number;
  defaultIndent?: number;
  selection?: string | null;
  onFolderSelect?: (folder: FileEntry) => void;
  onNameChange?: (text: string) => void;
}

export const FolderTreeNode: React.FC<FolderTreeNodeProps> = ({
  id,
  fileEntry,
  level = 0,
  levelIndent = 16,
  defaultIndent = 8,
  selection = null,
  draggable,
  onDragStart,
  onDragEnd,
  onFolderSelect,
  onNameChange,
  className,
  ...others
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(fileEntry.name);
  const selected = selection === id;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onFolderSelect) onFolderSelect(fileEntry);
    e.stopPropagation();
  };

  const handleToggleCollapse: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setCollapsed(!collapsed);
    e.stopPropagation();
  };

  const handleDoubleClick = () => {
    setInputValue(fileEntry.name);
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    inputRef.current?.select();
  };

  const handleInputBlur = () => {
    setEditing(false);
    if (onNameChange && inputValue !== fileEntry.name) {
      onNameChange(inputValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (editing && typeof inputValue === "string" && onNameChange) {
        inputRef.current?.blur();
        onNameChange(inputValue);
      }
    }
  };

  return (
    <li
      data-id={id}
      data-state={collapsed}
      data-level={level}
      data-selected={selected ? "on" : "off"}
      className=""
      {...others}
    >
      <div
        className={cn(
          "group/item flex flex-row items-center hover:bg-sidebar-accent w-full rounded-md p-2",
          selected && "font-medium bg-sidebar-accent",
          className
        )}
        style={{ paddingLeft: defaultIndent + level * levelIndent }}
        onClick={handleClick}
      >
        <div
          className="cursor-default select-none px-0 w-full"
          onDoubleClick={handleDoubleClick}
          draggable={draggable}
          onDragStart={onDragStart as any}
          onDragEnd={onDragEnd as any}
        >
          <div className="flex flex-row gap-2 items-center h-4 w-full relative">
            <div className="">
              {fileEntry.tag === DRAFTS_TAG ? (
                <FolderCheckIcon
                  size={16}
                  className="text-sidebar-accent-foreground"
                />
              ) : (
                <FolderIcon size={16} />
              )}
            </div>
            <div className="flex items-center relative h-full w-full text-xs">
              <div
                title={fileEntry.name}
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-full truncate flex items-center",
                  editing && "hidden"
                )}
              >
                <span className="text-sm truncate">{fileEntry.name}</span>
              </div>
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-full",
                  !editing && "hidden"
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="text-sm w-full h-full px-0 py-0 border-none bg-transparent outline-none"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="hidden group-hover/item:flex text-sidebar-foreground/40 h-4 cursor-pointer justify-end items-center gap-2 -mr-0.5">
          <div>
            <EllipsisIcon
              className={cn("hover:text-sidebar-accent-foreground")}
              size={16}
            />
          </div>
          <div onClick={handleToggleCollapse}>
            <ChevronDownIcon
              className={cn(
                "transition-transform duration-200 hover:text-sidebar-accent-foreground",
                collapsed && "rotate-90"
              )}
              size={16}
            />
          </div>
        </div>
      </div>
      <ul
        className={cn(
          "m-0 list-none p-0 flex flex-col gap-1",
          collapsed && "hidden"
        )}
      >
        {fileEntry.children?.toReversed().map((child) => (
          <FolderTreeNode
            id={child.fullPath}
            key={child.fullPath}
            fileEntry={child}
            level={level + 1}
            onFolderSelect={onFolderSelect}
          />
        ))}
      </ul>
    </li>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selection,
  onFolderSelect,
}) => {
  return (
    <ul
      className={cn(
        "m-0 list-none text-sm w-full max-w-full relative flex flex-col gap-1"
      )}
    >
      {folders.map((folder) => (
        <FolderTreeNode
          key={folder.fullPath}
          id={folder.fullPath}
          fileEntry={folder}
          selection={selection}
          onFolderSelect={onFolderSelect}
        />
      ))}
    </ul>
  );
};
