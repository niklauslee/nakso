import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import { MinusIcon, PanelLeftIcon, XIcon } from "lucide-react";
import { MaximizeWindowIcon } from "./icons";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppHeader({ children, className, ...others }: HeaderProps) {
  const platform = useAppStore((state) => state.platform);
  const showSidebar = useSettingStore((state) => state.showSidebar);

  return (
    <header
      data-manual-window-drag-region
      className={cn("flex items-center w-full h-12", className)}
      {...others}
    >
      <div
        className={cn(
          "w-full h-full flex items-center gap-1 px-4",
          !showSidebar && platform === "darwin" && "pl-22"
        )}
      >
        {!showSidebar && (
          <Button
            variant="ghost"
            size="icon-sm"
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={() => window.app?.commands.execute("view:toggle-sidebar")}
          >
            <PanelLeftIcon size={16} />
          </Button>
        )}
        {children}
      </div>
      {platform !== "darwin" && (
        <div className="h-full flex items-center">
          <Button
            size="icon"
            variant="ghost"
            title="Minimize"
            className="rounded-none h-full"
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={() => {
              getCurrentWindow().minimize();
            }}
          >
            <MinusIcon className="!size-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Maximize"
            className="rounded-none h-full"
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={() => {
              getCurrentWindow().toggleMaximize();
            }}
          >
            <MaximizeWindowIcon className="!size-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Close"
            className="rounded-none h-full"
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={() => {
              getCurrentWindow().close();
            }}
          >
            <XIcon className="!size-3" />
          </Button>
        </div>
      )}
    </header>
  );
}
