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
      d="M3 14.25L8.375 11L10 13.8438L19.1875 9"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SvgRoughnessNone;
