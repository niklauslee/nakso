import * as React from "react";
import type { IconProps } from "./types";

const SvgConnectionMargin = ({
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
      d="M16 14L22 14"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M18 11L15 14L18 17"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M15 5L12 8L9 5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <rect
      x="3"
      y="11"
      width="6"
      height="6"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);
export default SvgConnectionMargin;
