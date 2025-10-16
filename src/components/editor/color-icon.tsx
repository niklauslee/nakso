import { themeColors } from "@dgmjs/core";
import { cn } from "@/lib/utils";
import { EllipsisIcon } from "lucide-react";

interface ColorIconProps extends React.HTMLAttributes<HTMLDivElement> {
  darkMode?: boolean;
  value: string;
  border?: boolean;
  ellipsis?: boolean;
}

export function ColorIcon({
  darkMode,
  value,
  border,
  ellipsis,
  className,
}: ColorIconProps) {
  const c = value.startsWith("$")
    ? darkMode
      ? themeColors.dark[value.substring(1)]
      : themeColors.light[value.substring(1)]
    : value;
  return (
    <div
      className={cn(
        "rounded-full w-4 h-4 flex items-center justify-center",
        border && "border-3",
        className
      )}
      style={{
        ...(!border && { backgroundColor: c }),
        ...(border && { borderColor: c }),
      }}
    >
      {ellipsis && (
        <EllipsisIcon className="max-w-3.5 max-h-3.5 text-muted-foreground" />
      )}
    </div>
  );
}
