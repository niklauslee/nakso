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
import { ChevronDownIcon, FolderCheckIcon, FolderIcon } from "lucide-react";
import { FileEntry } from "@/api/workspace";
import { DRAFTS_TAG } from "@/const";

interface FileEntryTreeProps extends React.HTMLProps<HTMLUListElement> {
  fileEntries: FileEntry[];
  selectedId: string | null;
  focusedId: string | null;
  onFileEntrySelect?: (fileEntry: FileEntry) => void;
  onFileEntryDrop?: (fileEntry: FileEntry, droppedFiles: string[]) => void;
  onNameChange?: (fileEntry: FileEntry, text: string) => void;
}

interface FileEntryTreeNodeProps extends React.HTMLProps<HTMLLIElement> {
  id: string;
  fileEntry: FileEntry;
  level?: number;
  levelIndent?: number;
  defaultIndent?: number;
  selectedId?: string | null;
  focusedId?: string | null;
  onFileEntrySelect?: (fileEntry: FileEntry) => void;
  onFileEntryDrop?: (fileEntry: FileEntry, droppedFiles: string[]) => void;
  onNameChange?: (fileEntry: FileEntry, text: string) => void;
}

export const FileEntryTreeNode: React.FC<FileEntryTreeNodeProps> = ({
  id,
  fileEntry,
  level = 0,
  levelIndent = 16,
  defaultIndent = 8,
  selectedId = null,
  focusedId = null,
  onFileEntrySelect,
  onFileEntryDrop,
  onNameChange,
  className,
  ...others
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(fileEntry.name);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const selected = selectedId === id;
  const focused = focusedId === id;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onFileEntrySelect) onFileEntrySelect(fileEntry);
    e.stopPropagation();
  };

  const handleToggleCollapse: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setCollapsed(!collapsed);
    e.stopPropagation();
  };

  const handleDoubleClick = () => {
    if (fileEntry.tag === DRAFTS_TAG) return;
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
      onNameChange(fileEntry, inputValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (editing && typeof inputValue === "string" && onNameChange) {
        e.stopPropagation();
        setTimeout(() => {
          inputRef.current?.blur();
        }, 0);
      }
    } else if (e.key === "Escape") {
      setEditing(false);
      setInputValue(fileEntry.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (
      e.currentTarget instanceof HTMLElement &&
      e.currentTarget.classList.contains("file-entry-tree-node-item")
    ) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (data) {
      const droppedFiles = JSON.parse(data) as string[];
      if (onFileEntryDrop) {
        onFileEntryDrop(fileEntry, droppedFiles);
      }
    }
  };

  return (
    <li
      data-id={id}
      data-state={collapsed}
      data-level={level}
      data-selected={selected ? "on" : "off"}
      className="file-entry-tree-node"
      {...others}
    >
      <div
        className={cn(
          "file-entry-tree-node-item group/item flex flex-row items-center hover:bg-sidebar-accent w-full rounded-md p-2",
          selected && !editing && "font-medium bg-sidebar-accent",
          (focused || editing || isDragOver) &&
            "ring-2 ring-accent-foreground/25",
          className
        )}
        style={{ paddingLeft: defaultIndent + level * levelIndent }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="file-entry-tree-node-item-name cursor-default select-none px-0 w-full"
          onDoubleClick={handleDoubleClick}
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
        <div
          className={cn(
            "flex text-sidebar-foreground/40 h-4 cursor-pointer justify-end items-center gap-2 -mr-0.5",
            !(
              Array.isArray(fileEntry.children) && fileEntry.children.length > 0
            ) && "hidden"
          )}
        >
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
          "file-entry-tree-node-children m-0 list-none p-0 flex flex-col gap-1",
          collapsed && "hidden"
        )}
      >
        {fileEntry.children?.toReversed().map((child) => (
          <FileEntryTreeNode
            id={child.fullPath}
            key={child.fullPath}
            fileEntry={child}
            selectedId={selectedId}
            focusedId={focusedId}
            level={level + 1}
            onFileEntrySelect={onFileEntrySelect}
            onNameChange={onNameChange}
          />
        ))}
      </ul>
    </li>
  );
};

export const FileEntryTree: React.FC<FileEntryTreeProps> = ({
  fileEntries,
  selectedId,
  focusedId,
  onFileEntrySelect,
  onFileEntryDrop,
  onNameChange,
  className,
  ...others
}) => {
  return (
    <ul
      className={cn(
        "m-0 list-none text-sm w-full max-w-full relative flex flex-col gap-1",
        className
      )}
      {...others}
    >
      {fileEntries.map((entry) => (
        <FileEntryTreeNode
          key={entry.fullPath}
          id={entry.fullPath}
          fileEntry={entry}
          selectedId={selectedId}
          focusedId={focusedId}
          onFileEntrySelect={onFileEntrySelect}
          onFileEntryDrop={onFileEntryDrop}
          onNameChange={onNameChange}
        />
      ))}
    </ul>
  );
};
