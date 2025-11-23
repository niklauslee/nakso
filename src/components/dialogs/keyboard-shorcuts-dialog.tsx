/*
 * Copyright (c) 2023 MKLabs. All rights reserved.
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

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKeymapStore } from "../../store/keymap-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MouseIcon, MoveIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ShortcutGroupProps {
  title: string;
  children: React.ReactNode;
}

interface ShortcutItemProps {
  title: string;
  commands?: string[];
  alternative?: React.ReactNode;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center rounded border bg-secondary min-w-5 min-h-4 px-0.5 py-0 text-xs text-muted-foreground/80">
      {children}
    </div>
  );
}

export function ShortcutGroup({ title, children }: ShortcutGroupProps) {
  return (
    <div className="text-xs">
      <div className="font-semibold mb-2">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function ShortcutItem({
  title,
  commands,
  alternative,
}: ShortcutItemProps) {
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xs flex items-center gap-1">
        {commands &&
          commands.map((command, idx) => (
            <Kbd key={idx}>{formattedKeys[command]}</Kbd>
          ))}
        {alternative && <Kbd>{alternative}</Kbd>}
      </div>
    </div>
  );
}

export interface KeyboardShortcutsDialogState {
  open: boolean;
  show: (open: boolean) => void;
}

export const useKeyboardShortcutsDialog =
  create<KeyboardShortcutsDialogState>()(
    devtools(
      (set, get) => ({
        open: false,
        show: (open) => {
          set((state) => ({ open }));
        },
      }),
      { name: "KeyboardShortcutsDialogStore" }
    )
  );

export function KeyboardShortcutsDialog({}) {
  const { open, show } = useKeyboardShortcutsDialog();
  const [modKey, setModKey] = useState("");
  const [shiftKey, setShiftKey] = useState("");
  const [altKey, setAltKey] = useState("");

  useEffect(() => {
    const mod = window?.app.keymaps.formatKeyDescriptor("mod") ?? "";
    const shift = window?.app.keymaps.formatKeyDescriptor("shift") ?? "";
    const alt = window?.app.keymaps.formatKeyDescriptor("alt") ?? "";
    setModKey(mod);
    setShiftKey(shift);
    setAltKey(alt);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => show(open)}>
      <DialogContent className="w-full md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Keyboard shortcuts</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="h-[520px] w-full outline-none">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <ShortcutGroup title="Tools">
                <ShortcutItem title="Select" alternative="ESC" />
                <ShortcutItem
                  title="Hand (canvas scroll)"
                  commands={["tool:hand"]}
                />
                <ShortcutItem title="Eraser" commands={["tool:eraser"]} />
                <ShortcutItem title="Rectangle" commands={["tool:rectangle"]} />
                <ShortcutItem title="Ellipse" commands={["tool:ellipse"]} />
                <ShortcutItem title="Text" commands={["tool:text"]} />
                <ShortcutItem title="Image" commands={["tool:image"]} />
                <ShortcutItem title="Connector" commands={["tool:connector"]} />
                <ShortcutItem title="Line" commands={["tool:line"]} />
                <ShortcutItem title="Freehand" commands={["tool:freehand"]} />
                <ShortcutItem
                  title="Highlighter"
                  commands={["tool:highlighter"]}
                />
              </ShortcutGroup>
              <ShortcutGroup title="File">
                <ShortcutItem title="New" commands={["file:new"]} />
                <ShortcutItem title="Save" commands={["file:save"]} />
                <ShortcutItem
                  title="Export image"
                  commands={["view:show-export-image-dialog"]}
                />
                <ShortcutItem title="Quit" commands={["file:quit"]} />
              </ShortcutGroup>
              <ShortcutGroup title="Help">
                <ShortcutItem
                  title="Keyboard shortcuts"
                  commands={["help:keyboard-shortcuts"]}
                />
              </ShortcutGroup>
            </div>
            <div className="flex flex-col gap-4">
              <ShortcutGroup title="Edit">
                <ShortcutItem title="Undo" commands={["edit:undo"]} />
                <ShortcutItem title="Redo" commands={["edit:redo"]} />
                <ShortcutItem
                  title="Delete selection"
                  commands={["edit:delete"]}
                />
                <ShortcutItem title="Copy" commands={["edit:copy"]} />
                <ShortcutItem title="Cut" commands={["edit:cut"]} />
                <ShortcutItem title="Paste" commands={["edit:paste"]} />
                <ShortcutItem
                  title="Duplicate"
                  commands={["edit:duplicate"]}
                  alternative={
                    <>
                      {altKey}
                      <MouseIcon className="w-4 h-4" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Select all"
                  commands={["edit:select-all"]}
                />
                <ShortcutItem title="Group" commands={["shape:group"]} />
                <ShortcutItem title="Ungroup" commands={["shape:ungroup"]} />
                <ShortcutItem
                  title="Toggle lock"
                  commands={["shape:toggle-lock"]}
                />
                <ShortcutItem
                  title="Toggle hide"
                  commands={["shape:toggle-hide"]}
                />
                <ShortcutItem
                  title="Toggle container"
                  commands={["shape:toggle-container"]}
                />
                <ShortcutItem
                  title="Move selection (1px)"
                  alternative={
                    <>
                      <MoveIcon className="w-3 h-3" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Move selection"
                  alternative={
                    <>
                      {shiftKey}
                      <MoveIcon className="w-3 h-3" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Group selection"
                  commands={["shape:group"]}
                />
                <ShortcutItem
                  title="Ungroup selection"
                  commands={["shape:ungroup"]}
                />
              </ShortcutGroup>
            </div>
            <div className="flex flex-col gap-4">
              <ShortcutGroup title="View">
                <ShortcutItem
                  title="Scroll"
                  alternative={
                    <>
                      {modKey}
                      <MoveIcon className="w-3 h-3" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Scroll (mouse)"
                  alternative={
                    <>
                      Space
                      <MouseIcon className="w-3 h-3" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Zoom in/out"
                  commands={["view:zoom-in", "view:zoom-out"]}
                  alternative={
                    <>
                      {modKey}
                      <MouseIcon className="w-3 h-3" />
                    </>
                  }
                />
                <ShortcutItem
                  title="Zoom to 100%"
                  commands={["view:actual-size"]}
                />
                <ShortcutItem
                  title="Fit to screen"
                  commands={["view:fit-to-screen"]}
                />
                <ShortcutItem
                  title="Toggle sidebar"
                  commands={["view:toggle-sidebar"]}
                />
                <ShortcutItem
                  title="Toggle snap to grid"
                  commands={["view:snap-to-grid"]}
                />
                <ShortcutItem
                  title="Toggle snap to objects"
                  commands={["view:snap-to-objects"]}
                />
                <ShortcutItem
                  title="Toggle dark mode"
                  commands={["view:dark-mode"]}
                />
              </ShortcutGroup>
              <ShortcutGroup title="Alignment">
                <ShortcutItem
                  title="Bring forward"
                  commands={["align:bring-forward"]}
                />
                <ShortcutItem
                  title="Send backward"
                  commands={["align:send-backward"]}
                />

                <ShortcutItem
                  title="Bring to front"
                  commands={["align:bring-to-front"]}
                />
                <ShortcutItem
                  title="Send to back"
                  commands={["align:send-to-back"]}
                />
                <ShortcutItem
                  title="Align top"
                  commands={["align:align-top"]}
                />
                <ShortcutItem
                  title="Align left"
                  commands={["align:align-left"]}
                />
                <ShortcutItem
                  title="Align bottom"
                  commands={["align:align-bottom"]}
                />
                <ShortcutItem
                  title="Align right"
                  commands={["align:align-right"]}
                />
                <ShortcutItem
                  title="Align center"
                  commands={["align:align-center"]}
                />
                <ShortcutItem
                  title="Align middle"
                  commands={["align:align-middle"]}
                />
                <ShortcutItem
                  title="Distribute horizontally"
                  commands={["align:distribute-horizontally"]}
                />
                <ShortcutItem
                  title="Distribute vertically"
                  commands={["align:distribute-vertically"]}
                />
              </ShortcutGroup>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
