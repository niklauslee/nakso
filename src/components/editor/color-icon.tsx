import { themeColors } from "@dgmjs/core";
import { cn } from "@/lib/utils";

interface ColorIconProps extends React.HTMLAttributes<HTMLDivElement> {
  darkMode?: boolean;
  value: string;
  border?: boolean;
}

export function ColorIcon({
  darkMode,
  value,
  border,
  className,
}: ColorIconProps) {
  const c = value.startsWith("$")
    ? darkMode
      ? themeColors.dark[value.substring(1)]
      : themeColors.light[value.substring(1)]
    : value;
  return (
    <div
      className={cn("rounded-sm w-4 h-4", className)}
      style={{ backgroundColor: c }}
    ></div>
  );
}
