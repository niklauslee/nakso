import { FileCard } from "./file-card";
import { useExplorerStore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileEntry } from "@/api/workspace";
import { cn } from "@/lib/utils";
import { TRASH_TAG } from "@/const";

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  folder: FileEntry | null;
}

export function FolderView({ folder, className, ...others }: FolderViewProps) {
  if (!folder) return;

  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const fetchMoreFiles = useExplorerStore((state) => state.fetchMoreFiles);

  return (
    <InfiniteScrollArea
      className={cn("w-full h-full", className)}
      innerClassName="grid gap-4 w-full px-4 pt-0 pb-4 2xs:grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
      count={loadedFiles.length}
      totalCount={files.length}
      fetchFirstDeps={[folder]}
      fetchFirst={async () => {
        await fetchMoreFiles();
      }}
      fetchMore={async () => {
        await fetchMoreFiles();
      }}
      {...others}
    >
      {loadedFiles.length > 0 && (
        <>
          {loadedFiles.map((file) => (
            <FileCard
              key={file.fullPath}
              file={file}
              disabled={folder.tag === TRASH_TAG}
            />
          ))}
        </>
      )}
      {files.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-sm">
          No files
        </div>
      )}
    </InfiniteScrollArea>
  );
}
