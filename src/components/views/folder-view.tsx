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
import { useWorkspaceStore } from "@/store/workspace-store";
import { FileEntry } from "@/api/workspace";
import { Button } from "../ui/button";
import { ArrowUpRightIcon, FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface FolderViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FolderView({ ...others }: FolderViewProps) {
  const currentFolder = useWorkspaceStore((state) => state.currentFolder);
  const [files, setFiles] = useState<FileEntry[]>([]);

  const fetchFiles = async () => {
    const workspace = window.api.workspace;
    if (currentFolder) {
      const fetchedFiles = await workspace.getFiles(currentFolder.fullPath);
      setFiles(fetchedFiles);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolder?.fullPath]);

  return (
    <div className="absolute inset-0" {...others}>
      <Header>
        <div className="text-sm">{currentFolder?.name}</div>
      </Header>
      <article
        className={cn(
          "absolute top-12 bottom-0 inset-x-0 pointer-events-auto px-6 py-2"
        )}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap justify-start gap-6 w-full">
            {files.map((file) => (
              <Card key={file.fullPath} file={file} />
            ))}
          </div>
        )}
        {files.length === 0 && (
          <Empty className="w-full h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon />
              </EmptyMedia>
              <EmptyTitle>No Files Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any files yet. Get started by creating
                your first file.
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
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}

function Card({ file }: { file: FileEntry }) {
  return (
    <div className="w-48 h-fit rounded-xl">
      <div className="w-48 h-40 bg-muted/50 rounded-xl"></div>
      <div className="w-full h-8 flex items-center text-muted-foreground text-sm">
        {file.name}
      </div>
    </div>
  );
}
