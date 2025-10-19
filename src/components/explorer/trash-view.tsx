import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileSort } from "./file-sort";
import { useSettingStore } from "@/store/setting-store";
import { useExplorerStore } from "@/store/explorer-store";
import { Trash2Icon } from "lucide-react";

interface TrashViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TrashView({ ...others }: TrashViewProps) {
  const [trashPath, setTrashPath] = useState<string | null>(null);
  const workspaceDir = useSettingStore((state) => state.workspaceDir);
  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const sortBy = useExplorerStore((state) => state.sortBy);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const fetchMoreFiles = useExplorerStore((state) => state.fetchMoreFiles);
  const setSortBy = useExplorerStore((state) => state.setSortBy);

  useEffect(() => {
    fetchTrashDir();
  }, [workspaceDir]);

  const fetchTrashDir = async () => {
    if (!workspaceDir) return;
    const trashDir = await window.app.getTrashDir();
    if (trashDir) {
      setTrashPath(trashDir);
      setCurrentFolder(trashDir);
    }
  };

  return (
    <div className="absolute inset-0" {...others}>
      <AppHeader
        rightArea={
          <div className="pointer-events-auto">
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
          <Trash2Icon size={16} />
          Trash
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
          fetchFirstDeps={[trashPath]}
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
