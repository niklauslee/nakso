import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PanelLeftOpenIcon } from "lucide-react";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  rightArea?: React.ReactNode;
}

export function AppHeader({
  children,
  className,
  rightArea,
  ...others
}: HeaderProps) {
  const platform = useAppStore((state) => state.platform);
  const showSidebar = useSettingStore((state) => state.showSidebar);

  return (
    <header
      data-manual-window-drag-region
      className={cn(
        "flex items-center justify-between w-full h-12 px-4",
        className
      )}
      {...others}
    >
      <div
        className={cn(
          "h-full flex items-center gap-1 pointer-events-none",
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
      <div className="">{rightArea}</div>
    </header>
  );
}
