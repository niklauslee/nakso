import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { useRecentsStore } from "@/store/recents-store";
import { FileEntry, FileSortType, workspace } from "@/api/workspace";

const PAGE_SIZE = 20;

interface RecentsViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentsView({ ...others }: RecentsViewProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<FileEntry[]>([]);
  const [sortBy, setSortBy] = useState<FileSortType>({
    field: "mtime",
    direction: "desc",
  });
  const recentFiles = useRecentsStore((state) => state.files);
  const removeFromRecents = useRecentsStore((state) => state.removeFromRecents);

  const fetchAllFiles = async () => {
    const files: FileEntry[] = [];
    if (recentFiles) {
      for (const path of recentFiles) {
        try {
          const file = await workspace.getFileEntry(path);
          if (file) {
            files.push(file);
          }
        } catch (e) {
          removeFromRecents(path);
          console.error("Failed to fetch recent file:", path, e);
        }
      }
    }
    setFiles(workspace.sortFiles(files, sortBy));
    setLoadedFiles([]);
  };

  const fetchFiles = () => {
    setLoadedFiles(files.slice(0, loadedFiles.length + PAGE_SIZE));
  };

  useEffect(() => {
    fetchAllFiles();
  }, [recentFiles, sortBy]);

  return (
    <div className="absolute inset-0" {...others}>
      <AppHeader>
        <div className="text-sm">Recents</div>
      </AppHeader>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <InfiniteScrollArea
          className="w-full h-full"
          innerClassName="flex flex-wrap justify-start gap-6 w-full px-6 py-2"
          count={loadedFiles.length}
          totalCount={files.length}
          fetchFirstDeps={[files]}
          fetchFirst={async () => {
            await fetchFiles();
          }}
          fetchMore={async () => {
            await fetchFiles();
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
              No recent files
            </div>
          )}
        </InfiniteScrollArea>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}
