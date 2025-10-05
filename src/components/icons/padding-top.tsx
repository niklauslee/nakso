import type { IconProps } from "./types";

const SvgPaddingTop = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <path d="M6 3L18 3" stroke="currentColor" strokeWidth={strokeWidth} />
    <path
      d="M6 21L18 21"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth={strokeWidth}
    />
    <path
      d="M3 6L3 18"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth={strokeWidth}
    />
    <path
      d="M21 6V18"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth={strokeWidth}
    />
  </svg>
);
export default SvgPaddingTop;
