import { cn } from "@/lib/utils";
import { Header } from "../header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "../ui/button";
import { ArrowUpRightIcon, FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileEntry, FileSortType, workspace } from "@/api/workspace";
import { FileSort } from "./file-sort";
import { useFavoritesStore } from "@/store/favorites-store";

const PAGE_SIZE = 20;

interface FavoritesViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FavoritesView({ ...others }: FavoritesViewProps) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<FileEntry[]>([]);
  const [sortBy, setSortBy] = useState<FileSortType>({
    field: "mtime",
    direction: "desc",
  });
  const favoriteFiles = useFavoritesStore((state) => state.files);

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
  }, [favoriteFiles, sortBy]);

  return (
    <div className="absolute inset-0" {...others}>
      <Header
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
      </Header>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <InfiniteScrollArea
          className="w-full h-full"
          innerClassName="flex flex-wrap justify-start gap-6 w-full px-6 py-2"
          count={loadedFiles.length}
          totalCount={files.length}
          loading={loading}
          fetchFirstDeps={[files]}
          fetchFirst={async () => {
            setLoading(true);
            await fetchFiles();
            setLoading(false);
          }}
          fetchMore={async () => {
            setLoading(true);
            await fetchFiles();
            setLoading(false);
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
            <Empty className="w-full h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon />
                </EmptyMedia>
                <EmptyTitle>Empty Folder</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any files yet. Get started by
                  creating your first file.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button>Create File</Button>
                  <Button variant="outline">Import File</Button>
                </div>
              </EmptyContent>
              <Button
                variant="link"
                asChild
                className="text-muted-foreground"
                size="sm"
              >
                <a href="#">
                  Learn More <ArrowUpRightIcon />
                </a>
              </Button>
            </Empty>
          )}
        </InfiniteScrollArea>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}
