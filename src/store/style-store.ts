import { FillStyle, HorzAlign, VertAlign, type ShapeProps } from "@dgmjs/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_FONT_SIZE, DEFAULT_HAND_FONT } from "../const";

const commonStyleProps = [
  "fillColor",
  "fillStyle",
  "strokeColor",
  "strokePattern",
  "strokeWidth",
  "opacity",
  "roughness",
];

const textStyleProps = [
  "fillColor", // distinguish from commonStyle.fillColor
  "fontColor",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "horzAlign",
  "vertAlign",
  "lineHeight",
  "paragraphSpacing",
  "wordWrap",
];

const imageStyleProps = ["corners"];

const lineStyleProps = ["headEndType", "tailEndType"];

const connectorStyleProps = [
  "headEndType",
  "tailEndType",
  "headMargin",
  "tailMargin",
];

const freehandStyleProps = [
  "strokeWidth",
  "strokeColor",
  "thinning",
  "tailTaper",
  "headTaper",
];

const highlighterStyleProps = ["strokeWidth", "strokeColor", "opacity"];

export interface StyleState {
  commonStyle: ShapeProps;
  textStyle: ShapeProps;
  imageStyle: ShapeProps;
  lineStyle: ShapeProps;
  connectorStyle: ShapeProps;
  freehandStyle: ShapeProps;
  highlighterStyle: ShapeProps;
  setStyleProps: (shapeType: string, props: ShapeProps) => void;
  getStyleProps: (shapeType: string) => ShapeProps;
}

// extract props from a shape object only for the given keys
function extractProps(
  props: ShapeProps,
  keys: string[],
  exceptKeys: string[] = []
): ShapeProps {
  const newProps: ShapeProps = {};
  keys.forEach((key) => {
    if ((props as any)[key] !== undefined && !exceptKeys.includes(key)) {
      (newProps as any)[key] = (props as any)[key];
    }
  });
  // except props that should not be stored in style store
  if (newProps.strokeWidth === 0) delete newProps.strokeWidth;
  if (newProps.strokeColor === "$transparent") delete newProps.strokeColor;
  if (newProps.fillColor === "$transparent") delete newProps.fillColor;
  if (newProps.fontColor === "$transparent") delete newProps.fontColor;
  if (newProps.opacity === 0) delete newProps.opacity;
  return newProps;
}

export const useStyleStore = create<StyleState>()(
  persist(
    (set, get) => ({
      commonStyle: {
        fillColor: "$background",
        fillStyle: FillStyle.SOLID,
        strokeWidth: 2,
        strokeColor: "$foreground",
        strokePattern: [] as any,
        opacity: 1,
        roughness: 1,
      },
      textStyle: {
        fillColor: "$transparent",
        fontColor: "$foreground",
        fontFamily: DEFAULT_HAND_FONT,
        fontSize: DEFAULT_FONT_SIZE,
        fontStyle: "normal",
        fontWeight: 400,
        horzAlign: HorzAlign.CENTER,
        vertAlign: VertAlign.MIDDLE,
        lineHeight: 1.2,
        paragraphSpacing: 0,
        wordWrap: false,
      },
      imageStyle: {
        corners: [0, 0, 0, 0],
      },
      lineStyle: {
        headEndType: "flat",
        tailEndType: "flat",
      },
      connectorStyle: {
        headEndType: "arrow",
        tailEndType: "flat",
        headMargin: 0,
        tailMargin: 0,
      },
      freehandStyle: {
        strokeWidth: 8,
        strokeColor: "$foreground",
        thinning: 0,
        tailTaper: 0,
        headTaper: 0,
      },
      highlighterStyle: {
        strokeWidth: 28,
        strokeColor: "$yellow9",
        opacity: 0.5,
      },
      setStyleProps: (shapeType, props) => {
        switch (shapeType) {
          case "Rectangle":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps),
              },
              textStyle: {
                ...state.textStyle,
                ...extractProps(props, textStyleProps, ["fillColor"]),
              },
            }));
            break;
          case "Ellipse":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps),
              },
              textStyle: {
                ...state.textStyle,
                ...extractProps(props, textStyleProps, ["fillColor"]),
              },
            }));
            break;
          case "Text":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps, ["fillColor"]),
              },
              textStyle: {
                ...state.textStyle,
                ...extractProps(props, textStyleProps),
              },
            }));
            break;
          case "Image":
            set((state) => ({
              imageStyle: {
                ...state.imageStyle,
                ...extractProps(props, imageStyleProps),
              },
            }));
            break;
          case "Frame":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps),
              },
            }));
            break;
          case "Line":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps),
              },
              lineStyle: {
                ...state.lineStyle,
                ...extractProps(props, lineStyleProps),
              },
            }));
            break;
          case "Connector":
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps, [
                  "fillColor",
                  "fillStyle",
                ]),
              },
              connectorStyle: {
                ...state.connectorStyle,
                ...extractProps(props, connectorStyleProps),
              },
            }));
            break;
          case "Freehand":
            set((state) => ({
              freehandStyle: {
                ...state.freehandStyle,
                ...extractProps(props, freehandStyleProps),
              },
            }));
            break;
          case "Highlighter":
            set((state) => ({
              highlighterStyle: {
                ...state.highlighterStyle,
                ...extractProps(props, highlighterStyleProps),
              },
            }));
            break;
          default:
            set((state) => ({
              commonStyle: {
                ...state.commonStyle,
                ...extractProps(props, commonStyleProps),
              },
            }));
            break;
        }
      },
      getStyleProps: (shapeType) => {
        switch (shapeType) {
          case "Rectangle":
          case "Ellipse":
            return { ...get().textStyle, ...get().commonStyle }; // common style priority
          case "Text":
            return { ...get().commonStyle, ...get().textStyle }; // text style priority
          case "Image":
            return { ...get().imageStyle };
          case "Frame":
            return { ...get().commonStyle };
          case "Line":
            return { ...get().commonStyle, ...get().lineStyle };
          case "Connector":
            return { ...get().commonStyle, ...get().connectorStyle };
          case "Freehand":
            return { ...get().commonStyle, ...get().freehandStyle };
          case "Highlighter":
            return { ...get().highlighterStyle };
          default:
            return {};
        }
      },
    }),
    { name: "style-storage" }
  )
);
