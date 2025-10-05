import { DGMEditor } from "@dgmjs/react";
import { Editor as EditorType, Shape } from "@dgmjs/core";
import { useSettingStore } from "@/store/setting-store";

interface EditorProps {
  onMount?: (editor: EditorType) => void;
}

function Editor({ onMount }: EditorProps) {
  const showGrid = useSettingStore((state) => state.showGrid);

  const handleShapeInitialize = (shape: Shape) => {
    try {
      shape.fontFamily = "Loranthus";
      shape.fontSize = 16;
    } catch (error) {
      console.error("Error handling shape initialization:", error);
    }
  };

  return (
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
      onMount={onMount}
      onShapeInitialize={handleShapeInitialize}
      // onAction={handleAction}
      // onUndo={handleAction}
      // onRedo={handleAction}
      // onActiveHandlerChange={handleActiveHandlerChange}
      // onActiveHandlerLockChange={handleActiveHandlerLockChange}
      // onSelectionChange={handleSelectionChange}
      // onCurrentPageChange={handleCurrentPageChange}
      // onTextInplaceEditorMount={handleTextInplaceEditorMount}
      // onFileDrop={handleFileDrop}
      // onTextInplaceEditorOpen={handleTextInplaceEditorOpen}
      // onFloatingToolbarMove={handleFloatingToolbarMove}
    />
  );
}

export default Editor;
