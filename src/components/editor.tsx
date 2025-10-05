import { forwardRef, useImperativeHandle } from "react";
import { DGMEditor, DGMEditorProps } from "@dgmjs/react";
import { Editor as EditorType, Shape } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";
import { useEditingStore } from "@/store/editing-store";

interface EditorProps extends DGMEditorProps {}

const Editor = forwardRef<EditorType | null, EditorProps>(
  ({ onMount, ...props }, ref) => {
    const darkMode = useSettingStore((state) => state.darkMode);
    const showGrid = useSettingStore((state) => state.showGrid);
    const setSelection = useEditingStore((state) => state.setSelection);
    const setActiveHandler = useEditingStore((state) => state.setActiveHandler);
    // const [actionSequence, setActionSequence] = useState(0);
    // const [modified, setModified] = useState(false);

    useImperativeHandle(
      ref,
      () => {
        return window.app?.editor || null;
      },
      []
    );

    const handleMount = (editor: EditorType) => {
      if (ref && typeof ref === "object" && "current" in ref) {
        (ref as React.MutableRefObject<EditorType | null>).current = editor;
      }
      onMount?.(editor);
    };

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
      <DGMEditor
        {...props}
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
          ...props.options,
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
        // onTextInplaceEditorMount={handleTextInplaceEditorMount}
        // onFileDrop={handleFileDrop}
        // onTextInplaceEditorOpen={handleTextInplaceEditorOpen}
        // onFloatingToolbarMove={handleFloatingToolbarMove}
      />
    );
  }
);

Editor.displayName = "Editor";

export default Editor;
