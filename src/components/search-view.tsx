import { cn } from "@/lib/utils";
import { Header } from "./header";

interface SearchViewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchView({ ...others }: SearchViewProps) {
  return (
    <div className="absolute inset-0" {...others}>
      <Header>
        <div className="text-sm">Search...</div>
      </Header>
      <article
        className={cn("absolute top-12 bottom-0 inset-x-0 pointer-events-auto")}
      >
        <div className="p-4">Search...</div>
      </article>
    </div>
  );
}
