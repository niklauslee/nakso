import { cn } from "@/lib/utils";
import { AppHeader } from "../app-header";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileEntry, FileSortType, workspace } from "@/api/workspace";
import { FileSort } from "./file-sort";
import { useFavoritesStore } from "@/store/favorites-store";

const PAGE_SIZE = 20;

interface FavoritesViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FavoritesView({ ...others }: FavoritesViewProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<FileEntry[]>([]);
  const [sortBy, setSortBy] = useState<FileSortType>({
    field: "mtime",
    direction: "desc",
  });
  const favoriteFiles = useFavoritesStore((state) => state.files);
  const removeFromFavorites = useFavoritesStore(
    (state) => state.removeFromFavorites
  );

  const fetchAllFiles = async () => {
    const files: FileEntry[] = [];
    if (favoriteFiles) {
      for (const path of favoriteFiles) {
        try {
          const file = await workspace.getFileEntry(path);
          if (file) {
            files.push(file);
          }
        } catch (e) {
          removeFromFavorites(path);
          console.error("Failed to fetch favorite file:", path, e);
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
  }, [favoriteFiles, sortBy]);

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
        <div className="text-sm">Favorites</div>
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
              No favorite files
            </div>
          )}
        </InfiniteScrollArea>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}
