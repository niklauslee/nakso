import * as React from "react";
import type { IconProps } from "./types";

const SvgMaximizeWindow = ({
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
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <rect
      x="3"
      y="9"
      width="12"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>

  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   viewBox="0 0 24 24"
  //   width={size}
  //   height={size}
  //   fill="none"
  //   {...props}
  // >
  //   <path
  //     d="M4.125 11L12 5L19 20"
  //     stroke="currentColor"
  //     strokeWidth={strokeWidth}
  //     strokeLinecap="round"
  //   />
  // </svg>
);
export default SvgMaximizeWindow;
