import * as React from "react";
import type { IconProps } from "./types";

const SvgRoughLow = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M5.23371 4.59741C9.21431 4.27571 13.7377 4.86804 18.9623 4.70223M5.02532 4.58193C8.88803 4.66586 12.8635 4.53453 19.4157 4.52271M19.1661 4.93758C19.4114 7.99846 19.5039 11.6719 19.1324 19.0361M19.3675 4.75181C19.2666 8.57562 19.4803 12.4259 19.3494 19.3185M19.5 18.8721C15.6712 19.6048 11.9082 19.53 4.99439 19.4531M19.1468 19.4102C14.607 19.3896 9.76281 19.4845 4.8802 19.3889M5.03534 19.1998C4.51701 15.8963 5.28686 13.6154 4.5 4.51819M4.81472 19.3913C4.86905 13.7034 4.93876 8.06692 4.87504 4.71849"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      fill="none"
    ></path>
  </svg>
);

export default SvgRoughLow;
