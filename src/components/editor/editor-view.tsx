import { useEffect, useRef, useState } from "react";
import {
  Box,
  Editor as EditorType,
  FileDropEvent,
  Shape,
  ShapeProps,
} from "@dgmjs/core";
import { applyTextHorzAlign, cn, merge, trimObject } from "@/lib/utils";
import { ApplicationContextMenu } from "@/components/menu/context-menu";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/common/editable-text";
import { useMenuStore } from "@/store/menu-store";
import { AppHeader } from "../app-header";
import { Toolbar } from "./toolbar";
import { Palette } from "./palette";
import { ApplicationMenu } from "../menu/menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { DGMEditor } from "@dgmjs/react";
import { useSettingStore } from "@/store/setting-store";
import { useEditorStore } from "@/store/editor-store";
import { HelpButton } from "./help-button";
import { useStyleStore } from "@/store/style-store";
import { getFilesFromDataTransferItems } from "@/lib/flat-drop-files";
import { workspace } from "@/api/workspace";

interface EditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onMount?: (editor: EditorType) => void;
}

export function EditorView({ onMount, ...others }: EditorViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<EditorType | null>(null);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");

  const menus = useMenuStore((state) => state.menus);
  const darkMode = useSettingStore((state) => state.darkMode);
  const showGrid = useSettingStore((state) => state.showGrid);

  const filePath = useEditorStore((state) => state.filePath);
  const readonly = useEditorStore((state) => state.readonly);
  const modified = useEditorStore((state) => state.modified);
  const setModified = useEditorStore((state) => state.setModified);
  const selection = useEditorStore((state) => state.selection);
  const setSelection = useEditorStore((state) => state.setSelection);
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const setActiveHandler = useEditorStore((state) => state.setActiveHandler);
  const setActiveHandlerLock = useEditorStore(
    (state) => state.setActiveHandlerLock
  );
  const styleStore = useStyleStore();

  const isShapeTool =
    activeHandler &&
    [
      "Rectangle",
      "Ellipse",
      "Text",
      "Frame",
      "Line",
      "Connector",
      "Freehand",
      "Highlighter",
    ].includes(activeHandler);

  const shapeProps = isShapeTool
    ? [{ type: activeHandler, ...styleStore.getStyleProps(activeHandler!) }]
    : selection;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const _ of entries) {
        setTimeout(() => {
          editor?.fit();
        }, 0);
      }
    });
    wrapperRef.current && observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (filePath && editor) {
      editor.setEnabled(readonly === false);
      fetchFileName();
    }
  }, [filePath, readonly]);

  const fetchFileName = async () => {
    if (filePath) {
      const parsed = await workspace.parsePath(filePath);
      setFileName(parsed.name);
    } else {
      setFileName("");
    }
  };

  const handleMount = (editor: EditorType) => {
    setEditor(editor);
    if (onMount) onMount(editor);
  };

  const handleShapeInitialize = (shape: Shape) => {
    try {
      const styleProps = structuredClone(
        useStyleStore.getState().getStyleProps(shape.type)
      );
      Object.assign(shape, trimObject(styleProps));
      if (shape instanceof Box) applyTextHorzAlign(shape);
    } catch (error) {
      console.error("Error handling shape initialization:", error);
    }
  };

  const handleAction = () => {
    setModified(true);
    window.app.autoSaver.tick();
    setTimeout(() => window.app.updateUI(), 0);
  };

  const handleActiveHandlerChange = (handlerId: string) => {
    try {
      setActiveHandler(handlerId);
      editor?.selection.deselectAll();
    } catch (error) {
      console.error("Error handling active handler change:", error);
    }
  };

  const handleActiveHandlerLockChange = (lock: boolean) => {
    try {
      console.log("Handler lock changed:", lock);
      setActiveHandlerLock(lock);
      editor?.focus();
    } catch (error) {
      console.error("Error handling active handler lock change:", error);
    }
  };

  const handleSelectionChange = (shapes: Shape[]) => {
    setTimeout(() => {
      setSelection([...shapes]);
      window.app.updateUI();
    }, 0);
  };

  const handlePropsChange = (props: ShapeProps) => {
    try {
      if (!editor) return;
      if (isShapeTool) {
        styleStore.setStyleProps(activeHandler!, props);
      } else {
        const shapes = editor.selection.getShapes();
        const shapeType = merge(shapes.map((shape) => shape.type));
        editor.actions.update(props);
        styleStore.setStyleProps(shapeType!, props);
        setSelection([...shapes]);
      }
    } catch (error) {
      console.error("Error handling props change:", error);
    }
  };

  const handleFileDrop = async ({ event, dataTransfer }: FileDropEvent) => {
    try {
      if (!editor) return;
      const p = editor.canvas.globalCoordTransformRev([event.x, event.y]);
      const files = await getFilesFromDataTransferItems(dataTransfer.items);
      if (files.length === 1) {
        const file = files[0];
        switch (file.type) {
          case "image/png":
          case "image/jpeg":
          case "image/webp":
          case "image/svg+xml": {
            const image = await editor.factory.createImage(file, p);
            editor.actions.insert(image);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error handling file drop:", error);
    }
  };

  const handleTextInplaceEditorMount = (tiptapEditor: any) => {
    try {
      setTiptapEditor(tiptapEditor);
    } catch (error) {
      console.error("Error handling text inplace editor mount:", error);
    }
  };

  const handleTextInplaceEditorOpen = (shape: Shape) => {
    try {
      if (!editor || !tiptapEditor) return;
      editor.selection.deselectAll();
      // enforce the horz text align in tiptap editor
      const editContent = tiptapEditor.getText() ?? "";
      if (editContent.trim().length === 0) {
        tiptapEditor.commands.focus("end");
        tiptapEditor
          .chain()
          .focus()
          .setTextAlign((shape as Box).horzAlign)
          .run();
      }
    } catch (error) {
      console.error("Error handling text inplace editor open:", error);
    }
  };

  return (
    <div className="absolute inset-0" {...others}>
      <AppHeader
        rightArea={
          <ApplicationMenu menu={menus.main} className="w-36">
            <Button
              className="size-7 pointer-events-auto"
              variant="ghost"
              size="icon"
            >
              <EllipsisVerticalIcon size={16} />
            </Button>
          </ApplicationMenu>
        }
      >
        <div className="text-sm pointer-events-auto">
          <EditableText
            value={fileName}
            onValueChange={(value) => console.log("text edited:", value)}
          />
          {modified && <span> •</span>}
          {readonly && (
            <span className="text-muted-foreground px-2 bg-muted rounded ml-2 text-xs">
              Readonly
            </span>
          )}
        </div>
      </AppHeader>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
        ref={wrapperRef}
      >
        <ApplicationContextMenu menu={menus.context} className="w-44">
          <div className="absolute inset-0">
            <DGMEditor
              options={{
                showDOM: false,
                showCreateConnectorController: false,
                blankColor: "$slate4",
                canvasColor: "$background", // "$slate2",
                imageResize: {
                  quality: 1,
                  maxWidth: 1600,
                  maxHeight: 1600,
                },
              }}
              className="absolute inset-0"
              showGrid={showGrid}
              darkMode={darkMode}
              onMount={handleMount}
              onShapeInitialize={handleShapeInitialize}
              onAction={handleAction}
              onUndo={handleAction}
              onRedo={handleAction}
              onActiveHandlerChange={handleActiveHandlerChange}
              onActiveHandlerLockChange={handleActiveHandlerLockChange}
              onSelectionChange={handleSelectionChange}
              // onCurrentPageChange={handleCurrentPageChange}
              onFileDrop={handleFileDrop}
              onTextInplaceEditorMount={handleTextInplaceEditorMount}
              onTextInplaceEditorOpen={handleTextInplaceEditorOpen}
              // onFloatingToolbarMove={handleFloatingToolbarMove}
            />
          </div>
        </ApplicationContextMenu>
        <Palette selection={shapeProps} onChange={handlePropsChange} />
        <Toolbar />
        <HelpButton />
      </article>
    </div>
  );
}
