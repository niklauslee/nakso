/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import React from "react";
import { themeColors } from "@dgmjs/core";
import { cn } from "@/lib/utils";

export const basicPalette: string[][] = [
  [
    "$background",
    "$gray3",
    "$gray6",
    "$gray9",
    "$gray11",
    "$foreground",
    "$transparent",
  ],
  ["$red4", "$orange4", "$yellow4", "$lime4", "$green4", "$blue4", "$mint4"],
  ["$red9", "$orange9", "$yellow9", "$lime9", "$green9", "$blue9", "$mint9"],
];

export const simplePalette: string[][] = [
  [
    "$red3",
    "$purple3",
    "$blue3",
    "$green3",
    "$yellow3",
    "$gray3",
    "$background",
  ],
  [
    "$red6",
    "$purple6",
    "$blue6",
    "$green6",
    "$yellow6",
    "$gray6",
    "$foreground",
  ],
  [
    "$red9",
    "$purple9",
    "$blue9",
    "$green9",
    "$yellow9",
    "$gray9",
    "$transparent",
  ],
];

export const minimalPalette: string[][] = [
  [
    "$red9",
    "$orange9",
    "$pink9",
    "$purple9",
    "$blue9",
    "$cyan9",
    "$green9",
    "$brown9",
    "$yellow9",
    "$gray9",
    "$foreground",
  ],
];

const colors_ = [
  "slate",
  "gray",
  "red",
  "pink",
  "purple",
  "blue",
  "cyan",
  "green",
  "brown",
  "orange",
  "yellow",
  "lime",
  "mint",
];

const scales = Array.from(Array(12).keys()).map((i) => i + 1);
export const fullPalette: string[][] = colors_.map((c) =>
  scales.map((s) => `$${c}${s}`)
);

interface ColorItemProps {
  darkMode: boolean;
  value: string;
  border?: boolean;
  className?: string;
  onClick?: (value: string) => void;
}

export const ColorItem: React.FC<ColorItemProps> = ({
  darkMode,
  value,
  border = false,
  className,
  onClick,
}) => {
  const c = value.startsWith("$")
    ? darkMode
      ? themeColors.dark[value.substring(1)]
      : themeColors.light[value.substring(1)]
    : value;

  return (
    <div
      className={cn(
        "h-5 w-5 cursor-pointer rounded-full",
        border && "border-3 ",
        className,
        value === "$background" || value === "$transparent" ? "border" : ""
      )}
      style={{
        ...(!border &&
          value === "$transparent" && {
            backgroundImage: `url('data:image/svg+xml;utf8,<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.25" d="M0 4V0H4V4H8V8H4V4H0Z" fill="%237F7F7F"/></svg>')`,
            backgroundRepeat: "repeat",
          }),
        ...(!border && value !== "$transparent" && { backgroundColor: c }),
        ...(!border && { backgroundColor: c }),
        ...(border && { borderColor: c }),
      }}
      onClick={() => {
        if (onClick) onClick(value);
      }}
    />
  );
};

interface ColorPaletteProps {
  darkMode?: boolean;
  value?: string;
  palette: string[][];
  itemClassName?: string;
  className?: string;
  onClick?: (value: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  darkMode = false,
  value,
  palette,
  itemClassName,
  className,
  onClick,
}) => {
  return (
    <div>
      <div className={cn("flex flex-col gap-2", className)}>
        {palette.map((row, j) => (
          <div key={j} className={cn("flex flex-row gap-2", className)}>
            {row.map((c, i) => (
              <ColorItem
                key={i}
                className={cn(
                  itemClassName,
                  value === c ? "ring-2 ring-offset-1 ring-foreground/40" : ""
                )}
                darkMode={darkMode}
                value={c}
                onClick={(value) => {
                  if (onClick) onClick(value);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
