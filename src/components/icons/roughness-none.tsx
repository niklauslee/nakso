import * as React from "react";
import type { IconProps } from "./types";

const SvgRoughnessNone = ({
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
      d="M5.5 4.5L4.5 7.5L11.5 4.5L4.5 13L19.5 4.5L4.5 19.5L19.5 11L12.5 19.5L19.5 16.5L18.5 19.5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SvgRoughnessNone;
