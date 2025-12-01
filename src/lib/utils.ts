import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { HorzAlign, Text } from "@dgmjs/core";
import { ExportImageOptions } from "@dgmjs/export";
dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Return array which eliminates duplications
 * e.g.) unique([1, 2, 2, 3, 4, 4]) --> [1, 2, 3, 4]
 */
export function unique<T>(A: Array<T>): Array<T> {
  return Array.from(new Set(A).values());
}

/**
 * Return the homogenous value if array items are all same,
 * otherwise return initial.
 */
export function merge<T>(
  values: T[],
  stringifiedCompare: boolean = false,
  initial: T | undefined = undefined
): T | undefined {
  const vs = stringifiedCompare
    ? unique<string>(values.map((v) => JSON.stringify(v)))
    : unique<T>(values);
  return vs.length !== 1
    ? initial
    : stringifiedCompare
    ? JSON.parse(vs[0] as string)
    : (vs[0] as T);
}

/**
 * Returne the quantized value with decimal places.
 */
export function quantize(value: number, decimalPlaces: number = 0): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

/**
 * Trim object by removing undefined values.
 */
export function trimObject(obj: any) {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Return relative time from now.
 */
export function dateFromNow(date: Date): string {
  return dayjs(date).fromNow();
}

/**
 * Return the string with the first letter capitalized.
 */
export function toPascalCaseWithSpace(str: string) {
  return str
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Apply text's horzAlign to text doc
 */
export function applyTextHorzAlign(shape: Text) {
  if (
    shape.text &&
    shape.text.type === "doc" &&
    Array.isArray(shape.text.content)
  ) {
    switch (shape.horzAlign) {
      case HorzAlign.CENTER:
        shape.text.content.forEach((paragraph: any) => {
          if (paragraph.type === "paragraph" && paragraph.attrs) {
            paragraph.attrs.textAlign = "center";
          }
        });
        break;
      case HorzAlign.LEFT:
        shape.text.content.forEach((paragraph: any) => {
          if (paragraph.type === "paragraph" && paragraph.attrs) {
            paragraph.attrs.textAlign = "left";
          }
        });
        break;
      case HorzAlign.RIGHT:
        shape.text.content.forEach((paragraph: any) => {
          if (paragraph.type === "paragraph" && paragraph.attrs) {
            paragraph.attrs.textAlign = "right";
          }
        });
        break;
    }
  }
}

export function getImageExt(exportOptions: ExportImageOptions): string {
  switch (exportOptions.format) {
    case "image/png": {
      return "png";
    }
    case "image/jpeg": {
      return "jpg";
    }
    case "image/webp": {
      return "webp";
    }
    case "image/svg+xml": {
      return "svg";
    }
    default: {
      return "unknown";
    }
  }
}
