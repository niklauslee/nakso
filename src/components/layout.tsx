import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  onContentResize?: (width: number, height: number) => void;
}

export function Layout({
  sidebar,
  showSidebar = false,
  onContentResize,
  children,
  ...others
}: LayoutProps) {
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
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
