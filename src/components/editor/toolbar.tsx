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

import {
  CircleIcon,
  HandIcon,
  HighlighterIcon,
  ImageIcon,
  LockIcon,
  UnlockIcon,
  MousePointer2Icon,
  PencilIcon,
  SquareIcon,
  TypeIcon,
  EraserIcon,
  FrameIcon,
} from "lucide-react";
import { ConnectorIcon, LineIcon } from "@/components/icons";
import { useEditorStore } from "@/store/editor-store";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { useKeymapStore } from "@/store/keymap-store";
import { cn } from "@/lib/utils";

interface ToolItemProps {
  handlerId: string;
  name: string;
  hint?: string;
  keymap?: string;
  children: React.ReactNode;
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function ToolItem({
  hint,
  keymap,
  children,
  pressed,
  onPressedChange,
}: ToolItemProps) {
  return (
    <div className="relative flex items-center justify-center">
      <Toggle
        label={hint}
        size="sm"
        pressed={pressed}
        onPressedChange={onPressedChange}
        className="w-8 h-8 p-0 rounded-lg hover:text-foreground hover:bg-accent dark:data-[state=on]:bg-accent"
      >
        {children}
      </Toggle>
      {/* <div className="hidden w-2 h-3 md:flex items-center justify-center absolute right-[1px] bottom-[1px] text-[8px] opacity-40">
        {keymap}
      </div> */}
    </div>
  );
}

export function Toolbar({}) {
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const activeHandlerLock = useEditorStore((state) => state.activeHandlerLock);

  return (
    <div
      className={cn(
        "absolute bottom-4 w-full flex justify-center pointer-events-none"
      )}
    >
      <div className="bg-background dark:bg-sidebar border shadow-lg/5 rounded-xl relative flex items-center gap-1 p-1 pointer-events-auto">
        <Toggle
          label={activeHandlerLock ? "Unlock Active Tool" : "Lock Active Tool"}
          size="sm"
          pressed={activeHandlerLock}
          onPressedChange={() => {
            window.app.editor.setActiveHandlerLock(!activeHandlerLock);
          }}
          className="w-8 h-8 p-0 rounded-lg hover:text-foreground hover:bg-accent dark:data-[state=on]:bg-accent"
        >
          {activeHandlerLock ? (
            <LockIcon size={14} />
          ) : (
            <UnlockIcon size={14} />
          )}
        </Toggle>
        <Separator orientation="vertical" className="dark:bg-gray-700" />
        <ToolItem
          handlerId="Select"
          name="Select"
          hint={`Select ⎯ ${formattedKeys["tool:select"]}`}
          keymap={formattedKeys["tool:select"]}
          pressed={activeHandler === "Select"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateDefaultHandler();
            window.app.editor.focus();
          }}
        >
          <MousePointer2Icon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Hand"
          name="Hand"
          hint={`Hand ⎯ ${formattedKeys["tool:hand"]}`}
          keymap={formattedKeys["tool:hand"]}
          pressed={activeHandler === "Hand"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Hand");
            window.app.editor.focus();
          }}
        >
          <HandIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Eraser"
          name="Eraser"
          hint={`Eraser ⎯ ${formattedKeys["tool:eraser"]}`}
          keymap={formattedKeys["tool:eraser"]}
          pressed={activeHandler === "Eraser"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Eraser");
            window.app.editor.focus();
          }}
        >
          <EraserIcon size={16} />
        </ToolItem>
        <Separator orientation="vertical" className="dark:bg-gray-700" />
        <ToolItem
          handlerId="Rectangle"
          name="Rectangle"
          hint={`Rectangle ⎯ ${formattedKeys["tool:rectangle"]}`}
          keymap={formattedKeys["tool:rectangle"]}
          pressed={activeHandler === "Rectangle"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Rectangle");
            window.app.editor.focus();
          }}
        >
          <SquareIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Ellipse"
          name="Ellipse"
          hint={`Ellipse (Oval) ⎯ ${formattedKeys["tool:ellipse"]}`}
          keymap={formattedKeys["tool:ellipse"]}
          pressed={activeHandler === "Ellipse"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Ellipse");
            window.app.editor.focus();
          }}
        >
          <CircleIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Text"
          name="Text"
          hint={`Text ⎯ ${formattedKeys["tool:text"]}`}
          keymap={formattedKeys["tool:text"]}
          pressed={activeHandler === "Text"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Text");
            window.app.editor.focus();
          }}
        >
          <TypeIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Image"
          name="Image"
          hint={`Image ⎯ ${formattedKeys["tool:image"]}`}
          keymap={formattedKeys["tool:image"]}
          pressed={activeHandler === "Image"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Image");
            window.app.editor.focus();
          }}
        >
          <ImageIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Frame"
          name="Frame"
          hint={`Frame ⎯ ${formattedKeys["tool:frame"]}`}
          keymap={formattedKeys["tool:frame"]}
          pressed={activeHandler === "Frame"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Frame");
            window.app.editor.focus();
          }}
        >
          <FrameIcon size={16} />
        </ToolItem>
        <Separator orientation="vertical" className="dark:bg-gray-700" />
        <ToolItem
          handlerId="Connector"
          name="Connector"
          hint={`Connector ⎯ ${formattedKeys["tool:connector"]}`}
          keymap={formattedKeys["tool:connector"]}
          pressed={activeHandler === "Connector"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Connector");
            window.app.editor.focus();
          }}
        >
          <ConnectorIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Line"
          name="Line"
          hint={`Line ⎯ ${formattedKeys["tool:line"]}`}
          keymap={formattedKeys["tool:line"]}
          pressed={activeHandler === "Line"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Line");
            window.app.editor.focus();
          }}
        >
          <LineIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Freehand"
          name="Freehand"
          hint={`Freehand ⎯ ${formattedKeys["tool:freehand"]}`}
          keymap={formattedKeys["tool:freehand"]}
          pressed={activeHandler === "Freehand"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Freehand");
            window.app.editor.focus();
          }}
        >
          <PencilIcon size={16} />
        </ToolItem>
        <ToolItem
          handlerId="Highlighter"
          name="Highlighter"
          hint={`Highlighter ⎯ ${formattedKeys["tool:highlighter"]}`}
          keymap={formattedKeys["tool:highlighter"]}
          pressed={activeHandler === "Highlighter"}
          onPressedChange={(pressed) => {
            if (pressed) window.app.editor.activateHandler("Highlighter");
            window.app.editor.focus();
          }}
        >
          <HighlighterIcon size={16} />
        </ToolItem>
      </div>
    </div>
  );
}
