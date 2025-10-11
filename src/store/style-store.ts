import {
  FillStyle,
  HorzAlign,
  LineEndType,
  LineType,
  VertAlign,
  type ShapeProps,
} from "@dgmjs/core";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface StyleState {
  styleProps: ShapeProps;
  setStyleProps: (props: ShapeProps) => void;
}

export const useStyleStore = create<StyleState>()(
  devtools(
    persist(
      (set, get) => ({
        styleProps: {
          fillColor: "$background",
          fillStyle: FillStyle.SOLID,
          roughness: 1,
          strokeWidth: 2,
          strokeColor: "$foreground",
          strokePattern: [] as any,
          corners: [0, 0, 0, 0],
          fontSize: 20,
          horzAlign: HorzAlign.CENTER,
          vertAlign: VertAlign.MIDDLE,
          lineType: LineType.CURVE,
          tailEndType: LineEndType.FLAT,
          headEndType: LineEndType.ARROW,
        },
        setStyleProps: (props) => {
          set({ styleProps: { ...get().styleProps, ...props } });
        },
      }),
      { name: "style-storage" }
    ),
    { name: "StyleStore" }
  )
);
