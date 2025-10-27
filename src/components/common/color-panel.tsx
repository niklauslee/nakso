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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexAlphaColorPicker } from "react-colorful";
import "./react-colorful.css";
import { ColorPalette, fullPalette, simplePalette } from "./color-palette";
// import { TextField } from "@/components/ui/text-field";
import colorString from "color-string";
import { TextField } from "./text-field";

interface ColorPanelProps {
  darkMode: boolean;
  value: string;
  onChange: (color: string) => void;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({
  darkMode,
  value,
  onChange,
}) => {
  const handleColorChange = (color: string) => {
    if (onChange) onChange(color);
  };

  const handleColorTextChange = (color: string) => {
    const rgb = colorString.get.rgb(color);
    if (rgb) {
      const hex = colorString.to.hex(rgb[0], rgb[1], rgb[2], rgb[3]);
      if (hex && onChange) onChange(hex.toLowerCase());
    } else {
      if (onChange) onChange(value);
    }
  };

  return (
    <Tabs defaultValue="basic">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger className="text-xs" value="basic">
          Basic
        </TabsTrigger>
        <TabsTrigger className="text-xs" value="all">
          All
        </TabsTrigger>
        <TabsTrigger className="text-xs" value="rgb">
          RGB
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <div className="flex items-center justify-center py-2">
          <ColorPalette
            darkMode={darkMode}
            palette={simplePalette}
            onClick={handleColorChange}
          />
        </div>
      </TabsContent>
      <TabsContent value="all">
        <div className="flex items-center justify-center py-2">
          <ColorPalette
            darkMode={darkMode}
            palette={fullPalette}
            className="gap-0"
            itemClassName="h-4 w-4 rounded-none hover:border"
            onClick={handleColorChange}
          />
        </div>
      </TabsContent>
      <TabsContent value="rgb">
        <div className="flex items-center justify-center py-2">
          <HexAlphaColorPicker color={value} onChange={handleColorChange} />
        </div>
        <div>
          <TextField value={value ?? ""} onChange={handleColorTextChange} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
