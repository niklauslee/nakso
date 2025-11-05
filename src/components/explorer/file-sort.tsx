import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoveDownIcon, MoveUpIcon } from "lucide-react";
import { FileSortType } from "@/api/workspace";

interface FileSortProps extends React.HTMLAttributes<HTMLDivElement> {
  value: FileSortType;
  onValueChange: (value: FileSortType) => void;
}

export function FileSort({ value, onValueChange }: FileSortProps) {
  return (
    <Select
      value={`${value.field}-${value.direction}`}
      onValueChange={(value) => {
        console.log("value", value);
        onValueChange?.({
          field: value.split("-")[0] as any,
          direction: value.split("-")[1] as any,
        });
      }}
    >
      <SelectTrigger className="text-sm border-none shadow-none hover:bg-accent h-8 py-0 rounded-md gap-1.5 px-3">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc" className="text-xs">
          Alphabetical (A-Z)
        </SelectItem>
        <SelectItem value="name-desc" className="text-xs">
          Alphabetical (Z-A)
        </SelectItem>
        <SelectItem value="mtime-asc" className="text-xs">
          Oldest First
        </SelectItem>
        <SelectItem value="mtime-desc" className="text-xs">
          Newest First
        </SelectItem>
        {/* <SelectItem value="birthtime-asc" className="text-xs">
          Created ↓
        </SelectItem>
        <SelectItem value="birthtime-desc" className="text-xs">
          Created ↑
        </SelectItem> */}
      </SelectContent>
    </Select>
  );
}
