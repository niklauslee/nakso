import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  onContentResize?: (width: number, height: number) => void;
}

export function Layout({
  header,
  sidebar,
  showSidebar = false,
  onContentResize,
  children,
  ...others
}: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const platform = useAppStore((state) => state.platform);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const { width, height } = rect;
        if (onContentResize) onContentResize(width, height);
      }
    });
    ref.current && observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 select-none" {...others}>
      <SidebarProvider open={showSidebar}>
        {sidebar}
        <main
          className={cn(
            "fixed top-0 bottom-0 right-0 transition-[left] duration-200 ease-in-out",
            showSidebar ? "left-64" : "left-0"
          )}
        >
          <header data-tauri-drag-region className="w-full h-12 px-4">
            <div
              className={cn(
                "h-full flex items-center pointer-events-none",
                !showSidebar && platform === "darwin" && "pl-18"
              )}
            >
              {header}
            </div>
          </header>
          <article
            ref={ref}
            className={cn(
              "absolute top-12 bottom-0 inset-x-0 pointer-events-auto"
            )}
          >
            {children}
          </article>
        </main>
      </SidebarProvider>
    </div>
  );
}
