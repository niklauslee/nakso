import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { FileCard } from "./file-card";
import { useExplorerStore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileSort } from "./file-sort";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "../ui/button";
import {
  ClockIcon,
  FolderCheckIcon,
  FolderIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
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

function FolderHeader({ folder }: { folder: FileEntry }) {
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
    <AppHeader
      rightArea={
        <div className="flex items-center gap-1 pointer-events-auto">
          <Button
            size="icon-sm"
            variant="ghost"
            title="New File"
            onClick={handleNewFile}
          >
            <PlusIcon size={16} />
          </Button>
          <FileSort
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
            }}
          />
        </div>
      }
    >
      {folderTag === SEARCH_TAG && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <SearchIcon size={16} />
          Search
        </div>
      )}
      {folderTag === RECENTS_TAG && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <ClockIcon size={16} />
          Recents
        </div>
      )}
      {folderTag === FAVORITES_TAG && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <HeartIcon size={16} />
          Favorites
        </div>
      )}
      {folderTag === DRAFTS_TAG && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <FolderCheckIcon size={16} />
          Drafts
        </div>
      )}
      {folderTag === TRASH_TAG && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <Trash2Icon size={16} />
          Trash
        </div>
      )}
      {!folderTag && (
        <div className="flex items-center gap-2 text-sm pl-2">
          <FolderIcon size={16} />
          <Breadcrumb>
            <BreadcrumbList>
              {relDirTerms.map((part, index) => (
                <BreadcrumbItem key={index}>{part}</BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </AppHeader>
  );
}

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  folder: FileEntry | null;
}

export function FolderView({ folder, ...others }: FolderViewProps) {
  if (!folder) return;

  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const fetchMoreFiles = useExplorerStore((state) => state.fetchMoreFiles);

  return (
    <div className="absolute inset-0" {...others}>
      <FolderHeader folder={folder} />
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <InfiniteScrollArea
          className="w-full h-full"
          innerClassName="flex flex-wrap justify-start gap-6 w-full px-6 py-2"
          count={loadedFiles.length}
          totalCount={files.length}
          fetchFirstDeps={[folder]}
          fetchFirst={async () => {
            await fetchMoreFiles();
          }}
          fetchMore={async () => {
            await fetchMoreFiles();
          }}
        >
          {loadedFiles.length > 0 && (
            <>
              {loadedFiles.map((file) => (
                <FileCard key={file.fullPath} file={file} />
              ))}
            </>
          )}
          {files.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-sm">
              No files
            </div>
          )}
        </InfiniteScrollArea>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}
