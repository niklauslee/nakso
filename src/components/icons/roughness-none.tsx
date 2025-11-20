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
      d="M9.5 3.5L4 13L16.5 5L8 19L19.5 11.5L16 19.5"
      stroke="black"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SvgRoughnessNone;
