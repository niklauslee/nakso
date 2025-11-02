import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/store/app-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "../ui/button";
import { FolderOpenIcon } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

interface SettingsSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "label"> {
  label: React.ReactNode;
}

function SettingsSection({
  label,
  className,
  children,
  ...others
}: SettingsSectionProps) {
  return (
    <section className={cn("flex flex-col", className)} {...others}>
      <div className="py-2 border-b">
        <Label>{label}</Label>
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

interface SettingItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "label"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

function SettingItem({
  label,
  description,
  className,
  children,
  ...others
}: SettingItemProps) {
  return (
    <div className={cn("flex items-start justify-between py-2", className)}>
      <div className="flex flex-col gap-0.5">
        <div className="text-sm text-foreground/70">{label}</div>
        <div className="text-xs text-muted-foreground text-wrap">
          {description}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SettingsDialog() {
  const showSettings = useAppStore((state) => state.showSettings);
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const workspaceDir = useSettingStore((state) => state.workspaceDir);
  const setWorkspaceDir = useSettingStore((state) => state.setWorkspaceDir);

  const handleWorkspaceBrowse = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Workspace Folder",
    });
    if (typeof selected === "string") {
      setWorkspaceDir(selected);
      await window.app.setupWorkspace();
    }
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="sm:max-w-3xl w-3xl h-[600px] max-h-[90%] p-0 overflow-clip [&>button]:hidden">
        <div className="relative h-full w-full">
          <div className="absolute inset-y-0 left-0 w-48 bg-sidebar">
            <div className="flex flex-col gap-1 px-2 py-4">
              <div className="text-sm font-medium rounded-lg bg-sidebar-accent hover:bg-sidebar-accent text-sidebar-accent-foreground px-4 py-1.5">
                General
              </div>
              {/* <div className="text-sm font-medium rounded-lg bg-sidebar hover:bg-sidebar-accent text-sidebar-accent-foreground px-4 py-1.5">
                Styles
              </div> */}
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 left-48">
            <div className="flex flex-col gap-1 px-6 py-4">
              <SettingsSection label="Workspace" className="">
                <SettingItem
                  label="Workspace Folder"
                  description={workspaceDir || "No workspace selected"}
                >
                  <Button
                    size="icon-sm"
                    variant="outline"
                    title="Select Folder"
                    onClick={handleWorkspaceBrowse}
                  >
                    <FolderOpenIcon size={16} />
                  </Button>
                </SettingItem>
              </SettingsSection>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
