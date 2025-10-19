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
      <SelectTrigger className="text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">
          Alphabetical <MoveUpIcon />
        </SelectItem>
        <SelectItem value="name-desc">
          Alphabetical <MoveDownIcon />
        </SelectItem>
        <SelectItem value="mtime-asc">
          Modified <MoveUpIcon />
        </SelectItem>
        <SelectItem value="mtime-desc">
          Modified <MoveDownIcon />
        </SelectItem>
        <SelectItem value="birthtime-asc">
          Created <MoveUpIcon />
        </SelectItem>
        <SelectItem value="birthtime-desc">
          Created <MoveDownIcon />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
