import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import { MinusIcon, PanelLeftIcon, XIcon } from "lucide-react";
import { MaximizeWindowIcon } from "../icons";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TauriDragRegion } from "../common/tauri-drag-region";
import { Separator } from "../ui/separator";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  rightArea?: React.ReactNode;
  propagateEvents?: boolean;
  rightAreaPropagateEvents?: boolean;
}

export function AppHeader({
  children,
  className,
  rightArea,
  propagateEvents = false,
  rightAreaPropagateEvents = false,
  ...others
}: HeaderProps) {
  const platform = useAppStore((state) => state.platform);
  const showSidebar = useSettingStore((state) => state.showSidebar);

  return (
    <TauriDragRegion
      className={cn("flex items-center w-full h-full", className)}
      {...others}
    >
      <div
        className={cn(
          "w-full h-full flex items-center gap-2 px-4",
          !showSidebar && platform === "darwin" && "pl-22",
          platform !== "darwin" && "pr-0"
        )}
      >
        {!showSidebar && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Open Sidebar"
            onClick={() => window.app?.commands.execute("view:toggle-sidebar")}
          >
            <PanelLeftIcon size={16} />
          </Button>
        )}
        <div className="w-full h-full flex items-center justify-between">
          <div
            className="w-full flex items-center"
            onDoubleClick={(e) => {
              // don't propagate to tauri drag region
              if (!propagateEvents) e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // don't propagate to tauri drag region
              if (!propagateEvents) e.stopPropagation();
            }}
          >
            {children}
          </div>
          <div
            className="flex items-center"
            onDoubleClick={(e) => {
              // don't propagate to tauri drag region
              if (!rightAreaPropagateEvents) e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // don't propagate to tauri drag region
              if (!rightAreaPropagateEvents) e.stopPropagation();
            }}
          >
            {rightArea}
          </div>
        </div>
      </div>
      {platform !== "darwin" && (
        <div className="h-full flex items-center pr-2">
          <Separator orientation="vertical" className="!h-6 mx-2" />
          <Button
            size="icon-sm"
            variant="ghost"
            title="Minimize"
            className=""
            onClick={() => {
              getCurrentWindow().minimize();
            }}
          >
            <MinusIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title="Maximize"
            className=""
            onClick={() => {
              getCurrentWindow().toggleMaximize();
            }}
          >
            <MaximizeWindowIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title="Close"
            className=""
            onClick={() => {
              getCurrentWindow().close();
            }}
          >
            <XIcon size={16} />
          </Button>
        </div>
      )}
    </TauriDragRegion>
  );
}
