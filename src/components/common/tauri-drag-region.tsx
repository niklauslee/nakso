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
      onDoubleClick={(e) => {
        const appWindow = getCurrentWindow();
        appWindow.toggleMaximize();
      }}
      {...others}
    >
      {children}
    </div>
  );
}
