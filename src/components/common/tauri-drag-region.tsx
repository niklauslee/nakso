import { getCurrentWindow } from "@tauri-apps/api/window";

interface TauriDragRegionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TauriDragRegion({ children, ...others }: TauriDragRegionProps) {
  return (
    <div
      onMouseDown={(e) => {
        const appWindow = getCurrentWindow();
        if (e.buttons === 1 && e.detail !== 2) {
          appWindow.startDragging();
        }
      }}
      onDoubleClickCapture={(e) => {
        console.log("double click capture on tauri drag region");
      }}
      onDoubleClick={(e) => {
        console.log("double click on tauri drag region");
        const appWindow = getCurrentWindow();
        appWindow.toggleMaximize();
      }}
      {...others}
    >
      {children}
    </div>
  );
}
