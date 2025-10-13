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
import { useExplorertore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";

interface ExplorerViewProps extends React.HTMLAttributes<HTMLDivElement> {
  path: string | null;
}

export function ExplorerView({ path, ...others }: ExplorerViewProps) {
  if (!path) return;

  const [loading, setLoading] = useState(false);
  const files = useExplorertore((state) => state.files);
  const loadedFiles = useExplorertore((state) => state.loadedFiles);
  const setPath = useExplorertore((state) => state.setPath);
  const fetchFiles = useExplorertore((state) => state.fetchFiles);

  useEffect(() => {
    if (path) setPath(path);
  }, [path]);

  return (
    <div className="absolute inset-0" {...others}>
      <Header>
        <div className="text-sm">{path}</div>
      </Header>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <InfiniteScrollArea
          className="w-full h-full px-6 py-4"
          innerClassName="flex flex-wrap justify-start gap-6 w-full"
          count={loadedFiles.length}
          totalCount={files.length}
          loading={loading}
          fetchFirstDeps={[path]}
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
