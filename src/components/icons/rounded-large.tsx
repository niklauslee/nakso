import type { IconProps } from "./types";

const SvgRoundedLarge = ({
  size = 24,
  strokeWidth = 2,
  ...props
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 6H8C13.5228 6 18 10.4772 18 16V19"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export default SvgRoundedLarge;
