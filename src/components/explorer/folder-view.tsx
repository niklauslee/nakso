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
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "../ui/button";
import { ArrowUpRightIcon, FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FileCard } from "./file-card";
import { useExplorerStore } from "@/store/explorer-store";
import { InfiniteScrollArea } from "@/components/common/infinite-scroll-area";
import { FileSort } from "./file-sort";
import { useSettingStore } from "@/store/setting-store";

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  path: string | null;
}

export function FolderView({ path, ...others }: FolderViewProps) {
  if (!path) return;

  const [loading, setLoading] = useState(false);
  const [relDir, setRelDir] = useState<string[]>([]);
  const workspacePath = useSettingStore((state) => state.workspacePath);
  const files = useExplorerStore((state) => state.files);
  const loadedFiles = useExplorerStore((state) => state.loadedFiles);
  const sortBy = useExplorerStore((state) => state.sortBy);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const fetchFiles = useExplorerStore((state) => state.fetchFiles);
  const setSortBy = useExplorerStore((state) => state.setSortBy);

  useEffect(() => {
    const relPath = path.replace(workspacePath || "", "");
    const parts = relPath.split("/").filter((p) => p);
    setRelDir(parts);
    console.log("Current folder:", relPath);
    if (path) setCurrentFolder(path);
  }, [path]);

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
        <div className="text-sm">
          <Breadcrumb>
            <BreadcrumbList>
              {relDir.map((part, index) => (
                <BreadcrumbItem key={index}>{part}</BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
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
