import * as React from "react";
import type { IconProps } from "./types";

const SvgStrokePattern = ({
  size = 24,
  strokeWidth = 2,
  ...props
}: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 6L20 6"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M4 12L20 12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
    <path
      d="M4 18L20 18"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray="2 5"
    />
  </svg>
);
export default SvgStrokePattern;
