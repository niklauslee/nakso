import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Font = {
  category?: "sans" | "serif" | "mono" | "hand";
  family: string;
  style: "normal" | "italic";
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  src: string;
  builtin: boolean;
  unicodeRange?: string;
  sizeAdjust?: string;
  deprecated?: boolean;
};

export interface FontState {
  fonts: Font[];
  fetched: boolean;
  fetchFonts: (fonts: Font[]) => Promise<void>;
  addFonts: (fonts: Font[]) => void;
  getFamilies: (builtin: boolean) => string[];
  getDeprecatedFamilies: () => string[];
  getFontWeights: (family: string) => number[];
}

export const useFontStore = create<FontState>()(
  devtools(
    (set, get) => ({
      fonts: [] as Font[],
      fetched: false,
      fetchFonts: async (fonts) => {
        const fontPromises = fonts.map((font) => {
          const css = `${font.style === "italic" ? "italic" : ""} ${
            font.weight
          } 1em '${font.family}'`;
          return document.fonts.load(css, "Eng123한글中文ひらがな🙂🙏🏻");
        });
        await Promise.all(fontPromises);
        set({ fonts, fetched: true });
      },
      addFonts: (fonts: Font[]) => {
        set((state) => ({
          fonts: [
            ...state.fonts,
            ...fonts.map((font) => ({
              ...font,
              style: font.style ?? "normal",
              weight: font.weight ?? 400,
              builtin: font.builtin ?? false,
            })),
          ],
        }));
      },
      getFamilies: (builtin: boolean = true) => {
        if (builtin) {
          const builtinFonts = get().fonts.filter((font) => font.builtin);
          return Array.from(new Set(builtinFonts.map((font) => font.family)));
        } else {
          const sytemFonts = get().fonts.filter((font) => !font.builtin);
          return Array.from(new Set(sytemFonts.map((font) => font.family)));
        }
      },
      getDeprecatedFamilies: () => {
        return Array.from(
          new Set(
            get()
              .fonts.filter((font) => font.deprecated)
              .map((font) => font.family)
          )
        );
      },
      getFontWeights: (family) => {
        return Array.from(
          new Set(
            get()
              .fonts.filter((font) => font.family === family)
              .map((font) => font.weight)
          )
        ).sort();
      },
    }),
    { name: "FontStore" }
  )
);

function fontFaceToString(font: Font, urlPrefix?: string): string {
  const fontSrc =
    urlPrefix && font.src.startsWith("./") ? font.src.slice(1) : font.src;
  const fontFace = {
    "font-family": `'${font.family}'`,
    "font-style": font.style,
    "font-weight": font.weight,
    src: `url('${urlPrefix ?? ""}${fontSrc}') format('truetype')`,
    ...(font.unicodeRange && { "unicode-range": font.unicodeRange }),
    ...(font.sizeAdjust && { "size-adjust": font.sizeAdjust }),
  };
  const fields = Object.entries(fontFace)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@font-face {\n${fields}\n}`;
}

export function getFontsInStyle(fonts: Font[], urlPrefix?: string): string {
  return fonts.map((font) => fontFaceToString(font, urlPrefix)).join("\n");
}

export function insertFontsToDocument(fonts: Font[], urlPrefix?: string) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = getFontsInStyle(fonts, urlPrefix);
  document.head.appendChild(style);
}
