import type { IconProps } from "./types";

const SvgConnectionMarginLarge = ({
  size = 24,
  strokeWidth = 2,
  ...props
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <path
      d="M19 12H22"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M21 8L17 12L21 16.1562"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M2 5H7V19H2"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
    />
  </svg>
);
export default SvgConnectionMarginLarge;
