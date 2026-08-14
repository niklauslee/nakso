import { useEffect, useState } from "react";
import {
  Box,
  Editor as EditorType,
  FileDropEvent,
  Shape,
  ShapeProps,
} from "@dgmjs/core";
import { applyTextHorzAlign, cn, merge, trimObject } from "@/lib/utils";
import { ApplicationContextMenu } from "@/components/menu/context-menu";
import { useMenuStore } from "@/store/menu-store";
import { Toolbar } from "./toolbar";
import { Palette } from "./palette";
import { DGMEditor } from "@dgmjs/react";
import { useSettingStore } from "@/store/setting-store";
import { useEditorStore } from "@/store/editor-store";
import { useStyleStore } from "@/store/style-store";
import { getFilesFromDataTransferItems } from "@/lib/flat-drop-files";

interface EditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onMount?: (editor: EditorType) => void;
}

export function EditorView({ onMount, className, ...others }: EditorViewProps) {
  const [editor, setEditor] = useState<EditorType | null>(null);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);

  const menus = useMenuStore((state) => state.menus);
  const darkMode = useSettingStore((state) => state.darkMode);
  const snapToGrid = useSettingStore((state) => state.snapToGrid);
  const snapToObjects = useSettingStore((state) => state.snapToObjects);

  const setScale = useEditorStore((state) => state.setScale);
  const workingFile = useEditorStore((state) => state.workingFile);
  const readonly = workingFile?.readonly ?? true;
  const setModified = useEditorStore((state) => state.setModified);
  const selection = useEditorStore((state) => state.selection);
  const setSelection = useEditorStore((state) => state.setSelection);
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const setActiveHandler = useEditorStore((state) => state.setActiveHandler);
  const setActiveHandlerLock = useEditorStore(
    (state) => state.setActiveHandlerLock,
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
    if (workingFile && editor) {
      editor.setEnabled(readonly === false);
    }
  }, [workingFile, readonly]);

  const handleMount = (editor: EditorType) => {
    setEditor(editor);
    if (onMount) onMount(editor);
  };

  const handleShapeInitialize = (shape: Shape) => {
    try {
      const styleProps = structuredClone(
        useStyleStore.getState().getStyleProps(shape.type),
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
    setTimeout(() => window.app.updateMenu(), 0);
  };

  const handleZoom = (zoom: number) => {
    setScale(zoom);
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
      setActiveHandlerLock(lock);
      editor?.focus();
    } catch (error) {
      console.error("Error handling active handler lock change:", error);
    }
  };

  const handleSelectionChange = (shapes: Shape[]) => {
    setTimeout(() => {
      setSelection([...shapes]);
      window.app.updateMenu();
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
      const editor = window.app.editor;
      if (!editor) return;
      const p = editor.canvas.globalCoordTransformRev([event.x, event.y]);
      const files = Array.from(dataTransfer.files);
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
    <div
      className={cn("absolute inset-0", className)}
      // onPointerDown={(e) => {
      //   if (e.button === 2 && editor) {
      //     const canvas = editor.canvas;
      //     const rect = editor.canvasElement.getBoundingClientRect();
      //     // create canvas pointer event
      //     let _p = [e.clientX - rect.left, e.clientY - rect.top];
      //     let p = [_p[0] * canvas.ratio, _p[1] * canvas.ratio];
      //     const evt = new CanvasPointerEvent(p[0], p[1], e);
      //     // propagate to active handler
      //     (editor as any).activeHandler.pointerDown(editor, evt);
      //   }
      // }}
      // onPointerMove={(e) => {
      //   if (editor) {
      //     const canvas = editor.canvas;
      //     const rect = editor.canvasElement.getBoundingClientRect();
      //     // create canvas pointer event
      //     let _p = [e.clientX - rect.left, e.clientY - rect.top];
      //     let p = [_p[0] * canvas.ratio, _p[1] * canvas.ratio];
      //     const evt = new CanvasPointerEvent(p[0], p[1], e);
      //     // propagate to active handler
      //     (editor as any).activeHandler.pointerMove(editor, evt);
      //   }
      // }}
      {...others}
    >
      <ApplicationContextMenu
        menu={menus.context}
        className="w-fit outline-none"
      >
        <div
          className="absolute inset-0"
          // onDrop={handleFileDropOnEditorWrapper}
        >
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
            showGrid={snapToGrid}
            snapToGrid={snapToGrid}
            snapToObjects={snapToObjects}
            darkMode={darkMode}
            onMount={handleMount}
            onShapeInitialize={handleShapeInitialize}
            onAction={handleAction}
            onUndo={handleAction}
            onRedo={handleAction}
            onZoom={handleZoom}
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
    </div>
  );
}
