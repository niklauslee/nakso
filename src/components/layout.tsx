import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useEffect, useRef } from "react";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebarHeader?: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  onContentResize?: (width: number, height: number) => void;
}

export function Layout({
  header,
  sidebarHeader,
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
    <main className="fixed inset-0 select-none" {...others}>
      <aside
        className={cn(
          "z-10 absolute inset-y-0 left-0 w-56 bg-sidebar border-r transition-transform ease-linear duration-200",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <header className="w-full h-12" data-tauri-drag-region>
          <div className="w-full h-full flex items-center pointer-events-none">
            {sidebarHeader}
          </div>
        </header>
        {sidebar}
      </aside>
      <section
        className={cn(
          "fixed top-0 bottom-0 right-0",
          showSidebar ? "left-56" : "left-0"
        )}
      >
        <header data-tauri-drag-region className="w-full h-12 border-b">
          <div
            className={cn(
              "h-full flex items-center pointer-events-none",
              !showSidebar && platform === "darwin" && "pl-20"
            )}
          >
            {header}
          </div>
        </header>
        <article
          ref={ref}
          className={cn(
            "absolute top-12 bottom-0 inset-x-0 transition-transform ease-linear duration-200 pointer-events-auto"
          )}
        >
          {children}
        </article>
      </section>
    </main>
  );
}
