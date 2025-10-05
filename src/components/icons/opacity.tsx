import type { IconProps } from "./types";

const SvgOpacity = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect
      x="8"
      y="8"
      width="12"
      height="12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      fill="currentColor"
      fillOpacity="0.5"
    />
  </svg>
);
export default SvgOpacity;
