import type { IconProps } from "./types";

const SvgRoundedSmall = ({
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
      d="M5 6H14C16.2091 6 18 7.79086 18 10V19"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export default SvgRoundedSmall;
