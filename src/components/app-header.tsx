import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import { MinusIcon, PanelLeftIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MaximizeWindowIcon } from "./icons";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppHeader({ children, className, ...others }: HeaderProps) {
  const platform = useAppStore((state) => state.platform);
  const showSidebar = useSettingStore((state) => state.showSidebar);

  return (
    <header
      data-manual-window-drag-region
      className={cn("flex items-center w-full h-12 px-2 gap-2", className)}
      {...others}
    >
      <div
        className={cn(
          "w-full h-full flex items-center gap-1 pointer-events-none px-2",
          !showSidebar && platform === "darwin" && "pl-18"
        )}
      >
        {!showSidebar && (
          <Button
            className="pointer-events-auto"
            variant="ghost"
            size="icon-sm"
            onClick={() => window.app?.commands.execute("view:toggle-sidebar")}
          >
            <PanelLeftIcon size={16} />
          </Button>
        )}
        {children}
      </div>
      {/* <Separator orientation="vertical" className="max-h-6" /> */}
      {platform !== "darwin" && (
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            title="Minimize"
            onClick={() => getCurrentWindow().minimize()}
          >
            <MinusIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title="Maximize"
            onClick={() => getCurrentWindow().toggleMaximize()}
          >
            <MaximizeWindowIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title="Close"
            onClick={() => getCurrentWindow().close()}
          >
            <XIcon size={16} />
          </Button>
        </div>
      )}
    </header>
  );
}
