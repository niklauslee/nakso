import { useEffect, useRef } from "react";
import { Editor as EditorType, Shape } from "@dgmjs/core";
import { cn } from "@/lib/utils";
import { ApplicationContextMenu } from "@/components/menu/context-menu";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "@/store/menu-store";
import { Header } from "../header";
import { Toolbar } from "../toolbar";
import { Palette } from "../palette";
import { ApplicationMenu } from "../menu/menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { DGMEditor } from "@dgmjs/react";
import { useSettingStore } from "@/store/setting-store";
import { useEditingStore } from "@/store/editing-store";

interface EditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onMount?: (editor: EditorType) => void;
}

export function EditorView({ onMount, ...others }: EditorViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menus = useMenuStore((state) => state.menus);
  const darkMode = useSettingStore((state) => state.darkMode);
  const showGrid = useSettingStore((state) => state.showGrid);
  const setSelection = useEditingStore((state) => state.setSelection);
  const setActiveHandler = useEditingStore((state) => state.setActiveHandler);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const _ of entries) {
        setTimeout(() => {
          window.app?.editor.fit();
        }, 0);
      }
    });
    wrapperRef.current && observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const handleShapeInitialize = (shape: Shape) => {
    try {
      shape.fontFamily = "Loranthus";
      shape.fontSize = 16;
    } catch (error) {
      console.error("Error handling shape initialization:", error);
    }
  };

  const handleAction = () => {
    setTimeout(() => window.app.updateUIState(), 0);
  };

  const handleActiveHandlerChange = (handlerId: string) => {
    try {
      const app = window.app;
      setActiveHandler(handlerId);
      app?.editor.selection.deselectAll();
    } catch (error) {
      console.error("Error handling active handler change:", error);
    }
  };

  const handleActiveHandlerLockChange = (lock: boolean) => {
    try {
      const app = window.app;
      useEditingStore.getState().setActiveHandlerLock(lock);
      app?.editor.focus();
    } catch (error) {
      console.error("Error handling active handler lock change:", error);
    }
  };

  const handleSelectionChange = (shapes: Shape[]) => {
    setTimeout(() => {
      setSelection([...shapes]);
      window.app.updateUIState();
    }, 0);
  };

  return (
    <div className="absolute inset-0" {...others}>
      <Header
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
        <div className="text-sm">Editor...</div>
      </Header>
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
              onMount={onMount}
              onShapeInitialize={handleShapeInitialize}
              onAction={handleAction}
              onUndo={handleAction}
              onRedo={handleAction}
              onActiveHandlerChange={handleActiveHandlerChange}
              onActiveHandlerLockChange={handleActiveHandlerLockChange}
              onSelectionChange={handleSelectionChange}
              // onCurrentPageChange={handleCurrentPageChange}
              // onTextInplaceEditorMount={handleTextInplaceEditorMount}
              // onFileDrop={handleFileDrop}
              // onTextInplaceEditorOpen={handleTextInplaceEditorOpen}
              // onFloatingToolbarMove={handleFloatingToolbarMove}
            />
          </div>
        </ApplicationContextMenu>
        <Toolbar />
        <Palette />
      </article>
    </div>
  );
}
