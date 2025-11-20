import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { useExplorerStore } from "@/store/explorer-store";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "../ui/button";
import {
  ArrowUpDownIcon,
  ClockIcon,
  FolderCheckIcon,
  FolderIcon,
  HeartIcon,
  SearchIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { FileEntry, workspace } from "@/api/workspace";
import {
  DRAFTS_TAG,
  FAVORITES_TAG,
  RECENTS_TAG,
  SEARCH_TAG,
  TRASH_TAG,
} from "@/const";
import { ApplicationMenu } from "../menu/menu";
import { useMenuStore } from "@/store/menu-store";
import { MainMenu } from "./main-menu";
import { cn } from "@/lib/utils";

interface FolderViewHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  folder: FileEntry | null;
}

export function FolderViewHeader({
  folder,
  className,
  ...others
}: FolderViewHeaderProps) {
  if (!folder) return null;

  const menus = useMenuStore((state) => state.menus);
  const workspaceDir = useSettingStore((state) => state.workspaceDir);
  const sortBy = useExplorerStore((state) => state.sortBy);
  const setSortBy = useExplorerStore((state) => state.setSortBy);

  const sep = workspace.getSeparator();
  const relPath = workspace.getRelPath(workspaceDir!, folder.fullPath);
  const relDirTerms = relPath.split(sep).filter((p) => p);
  const folderTag = folder.tag;

  const handleNewFile = () => {
    if (!folder) return;
    window.app?.commands.execute("file:new", { basePath: folder?.fullPath });
  };

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-between",
        className
      )}
      {...others}
    >
      <div>
        {folderTag === SEARCH_TAG && (
          <div className="flex items-center gap-2 text-sm">
            <SearchIcon size={16} />
            Search
          </div>
        )}
        {folderTag === RECENTS_TAG && (
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon size={16} />
            Recents
          </div>
        )}
        {folderTag === FAVORITES_TAG && (
          <div className="flex items-center gap-2 text-sm">
            <HeartIcon size={16} />
            Favorites
          </div>
        )}
        {folderTag === DRAFTS_TAG && (
          <div className="flex items-center gap-2 text-sm">
            <FolderCheckIcon size={16} />
            Drafts
          </div>
        )}
        {folderTag === TRASH_TAG && (
          <div className="flex items-center gap-2 text-sm">
            <Trash2Icon size={16} />
            Trash
          </div>
        )}
        {!folderTag && (
          <div className="flex items-center gap-2 text-sm">
            <FolderIcon size={16} />
            <Breadcrumb>
              <BreadcrumbList>
                {relDirTerms.map((part, index) => (
                  <BreadcrumbItem key={index} className="text-foreground">
                    {part}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </div>
      <div className="flex items-center gap-0 pointer-events-auto">
        <Button
          size="icon-sm"
          variant="ghost"
          title="New File"
          onClick={handleNewFile}
        >
          <SquarePenIcon size={16} />
        </Button>
        <ApplicationMenu
          menu={menus.sort}
          className="w-52"
          align="end"
          render={<Button size="icon-sm" variant="ghost" title="Sort By" />}
        >
          <ArrowUpDownIcon size={16} />
        </ApplicationMenu>
        <MainMenu />
      </div>
    </div>
  );
}
