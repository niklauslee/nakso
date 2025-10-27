import * as React from "react";
import type { IconProps } from "./types";
import SvgRoughMedium from "./rough-medium";

const SvgRoughnessMedium = ({
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
      d="M3 13.0391C3 13.0105 3.38479 12.6401 4.13722 11.9856C4.80337 11.4063 5.61738 11.0065 6.49356 10.6279C7.37471 10.2472 8.03847 10.2088 8.29118 10.1886C8.8541 10.1436 8.91885 11.739 9.12805 12.1316C9.24318 12.3476 9.40491 12.4721 9.52727 12.5367C9.67274 12.6134 9.94226 12.5947 10.2738 12.5741C10.6029 12.5122 11.1079 12.3312 12.7909 11.4531C14.1366 10.7135 17.0854 10.377 19.5 9"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M3.5 14.7891C3.5 14.7605 3.74756 14.2169 4.5 13.5625C5.16614 12.9831 6.11738 12.7565 6.99356 12.3779C7.87471 11.9972 8.24729 11.7702 8.5 11.75C9.06292 11.705 9.41885 13.489 9.62805 13.8816C9.74318 14.0976 9.90491 14.2221 10.0273 14.2867C10.1727 14.3634 10.4423 14.3447 10.7738 14.3241C11.1029 14.2622 11.7091 14.2969 13.5 13.25C14.8256 12.4751 17.5854 11.377 20 10"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export default SvgRoughnessMedium;
