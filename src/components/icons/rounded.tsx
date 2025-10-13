import type { IconProps } from "./types";

const SvgRounded = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 6H12C15.3137 6 18 8.68629 18 12V19"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export default SvgRounded;
