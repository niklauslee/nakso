import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { workspace } from "@/api/workspace";
import { useExplorerStore } from "@/store/explorer-store";

interface SearchInputProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchInput({ ...others }: SearchInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const setFiles = useExplorerStore((state) => state.setFiles);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);
      const workspaceDir = window.app.getWorkspaceDir();
      const searchResult = await workspace.searchFiles(workspaceDir, value);
      setFiles(searchResult);
      setLoading(false);
    }
  };

  return (
    <div
      {...others}
      className="flex items-center gap-2 text-sm h-8 border rounded-md px-2"
    >
      {loading ? (
        <LoaderCircleIcon size={16} className="animate-spin" />
      ) : (
        <SearchIcon size={16} />
      )}
      <Input
        placeholder="Search..."
        className="w-fit px-0 border-none shadow-none focus-visible:ring-0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onDoubleClick={(e) => {
          // don't propagate to tauri drag region
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          // don't propagate to tauri drag region
          e.stopPropagation();
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
