import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { useExplorerStore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileSort } from "./file-sort";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "../ui/button";
import { FolderCheckIcon, FolderIcon, PlusIcon } from "lucide-react";
import { DRAFTS_FOLDER_NAME } from "@/const";
import { FileEntry } from "@/api/workspace";

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  folder: FileEntry | null;
}

export function FolderView({ folder, ...others }: FolderViewProps) {
  if (!folder) return;

  const [relDir, setRelDir] = useState<string[]>([]);
  const workspaceDir = useSettingStore((state) => state.workspaceDir);
  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const sortBy = useExplorerStore((state) => state.sortBy);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const fetchMoreFiles = useExplorerStore((state) => state.fetchMoreFiles);
  const setSortBy = useExplorerStore((state) => state.setSortBy);

  // useEffect(() => {
  //   const relPath = path.replace(workspaceDir || "", "");
  //   const parts = relPath.split("/").filter((p) => p);
  //   setRelDir(parts);
  //   if (path) setCurrentFolder(path);
  // }, [path]);

  const handleNewFile = () => {
    if (!folder) return;
    window.app?.commands.execute("file:new", { basePath: folder?.fullPath });
  };

  return (
    <div className="absolute inset-0" {...others}>
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
        <div className="flex items-center gap-2 text-sm pl-2">
          {relDir.join("") === DRAFTS_FOLDER_NAME ? (
            <FolderCheckIcon size={16} />
          ) : (
            <FolderIcon size={16} />
          )}
          <Breadcrumb>
            <BreadcrumbList>
              {relDir.map((part, index) => (
                <BreadcrumbItem key={index}>{part}</BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </AppHeader>
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
