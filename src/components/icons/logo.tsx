import * as React from "react";
import type { IconProps } from "./types";

const SvgLogo = ({ size = 832, strokeWidth = 70, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 832 832"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_256_52)">
      <rect width="832" height="832" rx="192" fill="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M196 256H260H388V320H260V384H359V448H260V576H196V448V384V320V256Z"
        fill="white"
      />
      <circle cx="516" cy="416" r="32" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M425.463 448C438.641 485.286 474.201 512 516 512C569.019 512 612 469.019 612 416C612 362.981 569.019 320 516 320C474.201 320 438.641 346.714 425.463 384H359.201C374.025 310.968 438.593 256 516 256C604.366 256 676 327.634 676 416C676 504.366 604.366 576 516 576C438.593 576 374.025 521.032 359.201 448H425.463Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_256_52">
        <rect width="832" height="832" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgLogo;
