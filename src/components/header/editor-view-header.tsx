import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/common/editable-text";
import { useMenuStore } from "@/store/menu-store";
import { ApplicationMenu } from "../menu/menu";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  DownloadIcon,
  LockIcon,
  SquarePenIcon,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { workspace } from "@/api/workspace";
import { useExplorerStore } from "@/store/explorer-store";
import { ToggleDarkModeButton } from "./toggle-darkmode-button";
import { MainMenu } from "./main-menu";
import { AppHeader } from "./app-header";

interface EditorViewHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EditorViewHeader({ ...others }: EditorViewHeaderProps) {
  const [fileName, setFileName] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const setView = useExplorerStore((state) => state.setView);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const menus = useMenuStore((state) => state.menus);
  const workingFile = useEditorStore((state) => state.workingFile);
  const scale = useEditorStore((state) => state.scale);
  const readonly = workingFile?.readonly ?? true;
  const modified = useEditorStore((state) => state.modified);

  useEffect(() => {
    if (workingFile) fetchFileName();
  }, [workingFile, readonly]);

  const fetchFileName = async () => {
    if (workingFile) {
      const parsed = await workspace.parsePath(workingFile.fullPath);
      setFileName(parsed.name);
    } else {
      setFileName("");
    }
  };

  const handleNewFile = () => {
    window.app?.commands.execute("file:new");
  };

  const handleExportImage = () => {
    window.app?.commands.execute("view:show-export-image-dialog");
  };

  const handleRenameFile = async (newName: string) => {
    await window.app.commands.execute("file:rename", {
      filePath: workingFile!.fullPath,
      newName,
    });
  };

  return (
    <AppHeader
      rightArea={
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleNewFile}
            title="New File"
          >
            <SquarePenIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleExportImage}
            title="Export Image"
          >
            <DownloadIcon size={16} />
          </Button>
          <ApplicationMenu
            menu={menus.view}
            align="end"
            open={openMenu === "view"}
            onOpenChange={(open) => setOpenMenu(open ? "view" : null)}
            className="w-fit"
            render={
              <Button
                size="sm"
                variant="ghost"
                title={`Zoom`}
                className="font-normal flex gap-1 items-center"
              />
            }
          >
            {Math.round(scale * 100) + "%"}
            <ChevronDownIcon className="size-3.5" />
          </ApplicationMenu>
          <ToggleDarkModeButton />
          <MainMenu />
        </div>
      }
      {...others}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-sm -ml-2",
          readonly && "opacity-50"
        )}
      >
        <Button
          size="icon-sm"
          variant="ghost"
          title="Back"
          onClick={(e) => {
            // use a timeout to allow all double click events to propagate first
            setTimeout(async () => {
              if (!workingFile) return;
              if (currentFolder?.fullPath === workingFile.dirname) {
                setView("folder");
              } else {
                const dirEntry = await workspace.getFileEntry(
                  workingFile?.dirname
                );
                setCurrentFolder(dirEntry);
                setView("folder");
              }
            }, 300);
          }}
        >
          <ChevronLeftIcon size={16} />
        </Button>
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            readonly && "opacity-50"
          )}
        >
          {readonly && <LockIcon size={16} />}
          <EditableText value={fileName} onValueChange={handleRenameFile} />
          {modified && <span> •</span>}
        </div>
      </div>
    </AppHeader>
  );
}
