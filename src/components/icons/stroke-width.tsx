import * as React from "react";
import type { IconProps } from "./types";

const SvgStrokeWidth = ({
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
    <path d="M4 6L20 6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 11L20 11" stroke="currentColor" strokeWidth="2" />
    <path d="M4 17L20 17" stroke="currentColor" strokeWidth="3.5" />
  </svg>
);
export default SvgStrokeWidth;
