import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";
import { useSettingStore } from "@/store/setting-store";
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

interface SettingsViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SettingsView({ ...others }: SettingsViewProps) {
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
    <div className="absolute inset-0" {...others}>
      <AppHeader rightArea={<div className="pointer-events-auto">...</div>}>
        <div className="text-sm">Settings</div>
      </AppHeader>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-4 px-4 mx-auto max-w-2xl mt-4">
            <SettingsSection label="Workspace" className="">
              <SettingItem
                label="Workspace Folder"
                description={workspaceDir || "No workspace selected"}
              >
                <Button
                  size="sm"
                  variant="outline"
                  title="Select Folder"
                  onClick={handleWorkspaceBrowse}
                >
                  <FolderOpenIcon size={16} />
                </Button>
              </SettingItem>
            </SettingsSection>

            {/* <SettingsSection label="Fonts" className="">
              <SettingItem
                label="Default Hand"
                description="The default hand to use for drawing"
              >
                asdfasdf
              </SettingItem>
              <SettingItem
                label="Default Sans"
                description="The default sans-serif font to use"
              >
                asdfasdf
              </SettingItem>
              <SettingItem label="Default Mono">asdfasdf</SettingItem>
              <SettingItem label="Default Serif">asdfasdf</SettingItem>
            </SettingsSection> */}
          </div>
        </ScrollArea>
      </article>
    </div>
  );
}
