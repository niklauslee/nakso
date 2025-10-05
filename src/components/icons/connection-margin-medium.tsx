import * as React from "react";
import type { IconProps } from "./types";

const SvgConnectionMarginMedium = ({
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
      d="M16 12L22 12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M19 8L15 12L19 16.1562"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M2 5H9V19H2"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
    />
  </svg>
);
export default SvgConnectionMarginMedium;
