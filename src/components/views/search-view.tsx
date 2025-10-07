import { cn } from "@/lib/utils";
import { Header } from "../header";
import { Button } from "../ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";

interface SearchViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchView({ ...others }: SearchViewProps) {
  const folders = useWorkspaceStore((state) => state.folders);
  const update = useWorkspaceStore((state) => state.update);

  return (
    <div className="absolute inset-0" {...others}>
      <Header>
        <div className="text-sm">Recents</div>
      </Header>
      <article
        className={cn(
          "absolute top-12 bottom-0 inset-x-0 pointer-events-auto px-4 py-2"
        )}
      >
        <div className="flex flex-wrap gap-4 w-fit mx-auto">
          <Button
            onClick={async () => {
              await window.api.workspace.ensureWorkspace();
              update();
            }}
          >
            Update
          </Button>
          <div>
            {folders.map((folder) => (
              <div key={folder.name}>{folder.name}</div>
            ))}
          </div>
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </article>
    </div>
  );
}

function Card() {
  return (
    <div className="w-48 h-fit rounded-xl">
      <div className="w-48 h-40 bg-muted/50 rounded-xl"></div>
      <div className="w-full h-8 flex items-center text-muted-foreground text-sm">
        2025-10-15
      </div>
    </div>
  );
}
