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

import React, { useId } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
  DropdownMenuPortal,
  DropdownMenuPositioner,
} from "@/components/ui/dropdown-menu";
import type {
  MenuItem as MenuItemType,
  Menu as MenuType,
} from "@/store/menu-store";
import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuProps {
  menu: MenuType;
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
  open?: boolean;
  render?: React.ReactElement<Record<string, unknown>>;
  onClick?: (id: string, command: string, commandArgs: any) => void;
  onOpenChange?: (open: boolean) => void;
}

interface MenuItemProp {
  item: MenuItemType;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const MenuItem: React.FC<MenuItemProp> = ({ item, onClick }) => {
  const id = useId();
  if (Array.isArray(item.submenu)) {
    return (
      <DropdownMenuSub key={item.id}>
        <DropdownMenuSubTrigger inset={item.inset}>
          {item.label}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuSubContent>
              {item.submenu.map((subitem, idx) => (
                <MenuItem key={idx} item={subitem} onClick={onClick} />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  } else if (item.type === "separator") {
    return (
      <DropdownMenuSeparator
        key={`${item.id}-separator-${id}`}
        className="my-1.5"
      />
    );
  } else if (item.type === "label") {
    return (
      <DropdownMenuLabel
        key={`${item.id}-separator-${id}`}
        inset={item.inset ?? false}
      >
        {item.label}
      </DropdownMenuLabel>
    );
  } else if (item.type === "checkbox") {
    return (
      <DropdownMenuCheckboxItem
        key={item.id}
        data-id={item.id}
        data-command={item.command}
        data-command-args={JSON.stringify(item["command-args"])}
        onClick={onClick}
        disabled={!item.enabled}
        checked={item.checked}
        className="text-[13px] py-1 pl-6 pr-3 [&_span]:left-1"
      >
        {item.label}
        {item.subtext && (
          <DropdownMenuShortcut>{item.subtext}</DropdownMenuShortcut>
        )}
      </DropdownMenuCheckboxItem>
    );
  } else {
    return (
      <DropdownMenuItem
        inset={item.inset}
        key={item.id}
        data-id={item.id}
        data-command={item.command}
        data-command-args={JSON.stringify(item["command-args"])}
        onClick={onClick}
        disabled={!item.enabled}
        className="text-[13px] py-1 pl-3 pr-3 data-[inset]:pl-6"
      >
        {item.label}
        {item.subtext && (
          <DropdownMenuShortcut>{item.subtext}</DropdownMenuShortcut>
        )}
        {!item.subtext && item.external && (
          <DropdownMenuShortcut>
            <ExternalLinkIcon
              size={16}
              strokeWidth={1.5}
              className="!size-3.5"
            />
          </DropdownMenuShortcut>
        )}
      </DropdownMenuItem>
    );
  }
};

export const ApplicationMenu: React.FC<MenuProps> = ({
  menu,
  className,
  children,
  align = "start",
  sideOffset = 10,
  render,
  open,
  onClick,
  onOpenChange,
}) => {
  const handleSelect = (event: any) => {
    const id = event.target?.dataset.id;
    const command = event.target?.dataset.command;
    const commandArgs = event.target.dataset.commandArgs
      ? JSON.parse(event.target.dataset.commandArgs)
      : {};
    if (onClick) {
      onClick(id, command, commandArgs);
    } else {
      if (command) {
        // Use setTimeout to avoid react-remove-scroll-bar error
        setTimeout(
          async () => await window.app.commands.execute(command, commandArgs),
          0
        );
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={render}>{children}</DropdownMenuTrigger>
      <DropdownMenuPositioner align={align} sideOffset={sideOffset}>
        <DropdownMenuContent className={cn("p-1.5 shadow-lg", className)}>
          {Array.isArray(menu) &&
            menu.map((item, idx) => (
              <MenuItem key={idx} item={item} onClick={handleSelect} />
            ))}
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenu>
  );
};
