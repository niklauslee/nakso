import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/common/editable-text";
import { useMenuStore } from "@/store/menu-store";
import { ApplicationMenu } from "../menu/menu";
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  LockIcon,
  PlusIcon,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { workspace } from "@/api/workspace";

export function EditorViewHeader({}) {
  const [fileName, setFileName] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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

  const handleRenameFile = async (newName: string) => {
    await window.app.commands.execute("file:rename", {
      filePath: workingFile!.fullPath,
      newName,
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-between">
      <div
        className={cn(
          "flex items-center gap-2 text-sm pointer-events-auto",
          readonly && "opacity-50"
        )}
      >
        {readonly && <LockIcon size={16} />}
        <EditableText value={fileName} onValueChange={handleRenameFile} />
        {modified && <span> •</span>}
      </div>
      <div className="flex items-center gap-1 pointer-events-auto">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleNewFile}
          title="New File"
        >
          <PlusIcon size={16} />
        </Button>
        <ApplicationMenu
          menu={menus.view}
          align="end"
          open={openMenu === "view"}
          onOpenChange={(open) => setOpenMenu(open ? "view" : null)}
        >
          <Button
            size="sm"
            variant="ghost"
            title={`Zoom/view options`}
            className="font-normal flex gap-1 items-center"
          >
            {Math.round(scale * 100) + "%"}
            <ChevronDownIcon className="size-3.5" />
          </Button>
        </ApplicationMenu>
        <ApplicationMenu
          menu={menus.main}
          className="w-52"
          open={openMenu === "main"}
          onOpenChange={(open) => setOpenMenu(open ? "main" : null)}
        >
          <Button className="size-7" variant="ghost" size="icon" title="Menu">
            <EllipsisVerticalIcon size={16} />
          </Button>
        </ApplicationMenu>
      </div>
    </div>
  );
}
