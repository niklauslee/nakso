import { Toggle } from "@/components/ui/toggle";
import {
  FillCrossHatchIcon,
  FillHachureIcon,
  FillNoneIcon,
  FillSolidIcon,
  StrokeDashedIcon,
  StrokeDottedIcon,
  StrokeSolidIcon,
  VerticalMiddleIcon,
  VerticalTopIcon,
  VerticalBottomIcon,
  AlignBringForwardIcon,
  AlignBringToFrontIcon,
  AlignSendBackwardIcon,
  AlignSendToBackIcon,
  LineStraightIcon,
  LineCurveIcon,
  RoundedIcon,
  RoughnessLowIcon,
  RoughnessNoneIcon,
  RoughnessHighIcon,
  PaddingIndependentIcon,
  StrokeWidthIcon,
} from "@/components/icons";
import {
  PenLineIcon,
  TypeIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  MinusIcon,
  AlignStartVerticalIcon,
  AlignCenterVerticalIcon,
  AlignEndVerticalIcon,
  AlignHorizontalSpaceAroundIcon,
  AlignStartHorizontalIcon,
  AlignCenterHorizontalIcon,
  AlignEndHorizontalIcon,
  AlignVerticalSpaceAroundIcon,
  Settings2Icon,
  MaximizeIcon,
  SquareDashedTopSolidIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  ShapeProps,
  FillStyle,
  Box,
  Text,
  HorzAlign,
  VertAlign,
  Line,
  LineEndTypeEnum,
  LineType,
  Path,
  BorderPosition,
  BorderPositionEnum,
} from "@dgmjs/core";
import { cn, merge, toPascalCaseWithSpace } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import { useKeymapStore } from "@/store/keymap-store";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "../ui/scroll-area";
import { useEditorStore } from "@/store/editor-store";
import { SelectArrowhead } from "./select-arrowhead";
import {
  DEFAULT_HAND_FONT,
  DEFAULT_MONO_FONT,
  DEFAULT_SANS_FONT,
  DEFAULT_SERIF_FONT,
} from "@/const";
import { ColorPanel } from "@/components/common/color-panel";
import { ColorItem } from "@/components/common/color-palette";
import { NumberField } from "@/components/ui/number-field";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ToolProps {
  selection: ShapeProps[];
  onChange?: (values: ShapeProps) => void;
}

interface PaletteProps {
  selection: ShapeProps[];
  onChange?: (values: ShapeProps) => void;
}

function hasShapeType(
  tool: string | null,
  selection: ShapeProps[],
  type: string,
) {
  return tool === type || selection.some((s) => s.type === type);
}

function isShapeTool(tool: string | null) {
  return [
    "Rectangle",
    "Ellipse",
    "Text",
    "Image",
    "Icon",
    "Group",
    "Frame",
    "Line",
    "Connector",
    "Freehand",
    "Highlighter",
  ].includes(tool || "");
}

export function Palette({ selection, onChange }: PaletteProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const tool = useEditorStore((state) => state.activeHandler);
  const hasMulti = selection.length > 1;
  const hasSelection = selection.length > 0;
  const isVisible = hasSelection || isShapeTool(tool);

  const hasRectangle = hasShapeType(tool, selection, "Rectangle");
  const hasEllipse = hasShapeType(tool, selection, "Ellipse");
  const hasText = hasShapeType(tool, selection, "Text");
  const hasImage = hasShapeType(tool, selection, "Image");
  const hasIcon = hasShapeType(tool, selection, "Icon");
  const hasGroup = hasShapeType(tool, selection, "Group");
  const hasFrame = hasShapeType(tool, selection, "Frame");
  const hasLine = hasShapeType(tool, selection, "Line");
  const hasClosedPath = selection.some(
    (s) => s instanceof Path && s.isClosed(),
  );
  const hasConnector = hasShapeType(tool, selection, "Connector");
  const hasFreehand = hasShapeType(tool, selection, "Freehand");
  const hasHighlighter = hasShapeType(tool, selection, "Highlighter");

  // keep scroll area height in sync with container
  useEffect(() => {
    if (!outerRef.current) return;
    const observer = new ResizeObserver(() => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      const scroll = scrollRef.current;
      if (!outer || !inner || !scroll) return;
      const outerHeight = outer.getBoundingClientRect().height;
      const innerHeight = inner.getBoundingClientRect().height;
      if (innerHeight + 2 > outerHeight) {
        scroll.style.setProperty("height", `${outerHeight}px`);
      } else {
        scroll.style.removeProperty("height");
      }
    });
    observer.observe(outerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className={cn(
        "absolute top-4 bottom-4 right-4 w-fit z-10 pointer-events-none",
        !isVisible && "hidden",
      )}
    >
      <ScrollArea
        ref={scrollRef}
        className="w-full max-h-full bg-background dark:bg-sidebar border shadow-lg/5 rounded-lg pointer-events-auto"
      >
        <div ref={innerRef} className="flex flex-col gap-1.5 w-full h-fit p-2">
          {(hasRectangle || hasEllipse || hasFrame || hasClosedPath) && (
            <>
              <FillColorTool selection={selection} onChange={onChange} />
              <FillStyleTool selection={selection} onChange={onChange} />
              <Separator className="opacity-50" />
            </>
          )}

          {!hasImage && !hasGroup && (
            <StrokeColorTool selection={selection} onChange={onChange} />
          )}
          {(hasRectangle ||
            hasEllipse ||
            hasIcon ||
            hasFrame ||
            hasLine ||
            hasConnector) && (
            <>
              <StrokeWidthTool selection={selection} onChange={onChange} />
              <StrokePatternAndRoughTool
                selection={selection}
                onChange={onChange}
              />
            </>
          )}
          {(hasRectangle || hasFrame) && (
            <>
              <StrokeCornerAndBorderTool
                selection={selection}
                onChange={onChange}
              />
            </>
          )}

          {!hasRectangle &&
            !hasEllipse &&
            !hasFrame &&
            !hasLine &&
            !hasConnector &&
            (hasFreehand || hasHighlighter) && (
              <FreehandWidthTool selection={selection} onChange={onChange} />
            )}

          {(hasRectangle || hasEllipse || hasText || hasFrame) && (
            <>
              <Separator className="opacity-50" />
              <FontFamilyTool selection={selection} onChange={onChange} />
              <FontSizeTool selection={selection} onChange={onChange} />
              {!hasFrame && (
                <TextAlignTool selection={selection} onChange={onChange} />
              )}
            </>
          )}

          {(hasLine || hasConnector) && (
            <>
              <Separator className="opacity-50" />
              <LineTool selection={selection} onChange={onChange} />
            </>
          )}

          {hasSelection && (
            <>
              <Separator className="opacity-50" />
              <OpacityTool selection={selection} onChange={onChange} />
              <Separator className="opacity-50" />
              <LayerTool selection={selection} onChange={onChange} />
              {hasMulti && (
                <AlignmentTool selection={selection} onChange={onChange} />
              )}
            </>
          )}

          {(hasRectangle || hasEllipse || hasFrame || hasClosedPath) && (
            <>
              <Separator className="opacity-50" />
              <PositionAndSizeTool selection={selection} onChange={onChange} />
            </>
          )}

          {hasSelection && (
            <>
              {/* <Separator className="opacity-50" />
              <AdditionalTools selection={selection} onChange={onChange} /> */}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FillColorTool({ selection, onChange }: ToolProps) {
  const darkMode = useSettingStore((state) => state.darkMode);
  const fillColor = merge(selection.map((s) => s.fillColor));

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Popover modal={true}>
          <PopoverTrigger
            render={
              <Button size="icon-xs" variant="ghost" title="Fill color" />
            }
          >
            <ColorItem
              className="rounded-sm size-5 border-1 border-neutral-300 dark:border-neutral-600"
              value={fillColor ?? "$background"}
              darkMode={darkMode}
            />
          </PopoverTrigger>
          <PopoverPositioner side="left" align="start" sideOffset={8}>
            <PopoverContent className="w-fit text-center">
              <ColorPanel
                darkMode={darkMode}
                value={fillColor ?? "$background"}
                onChange={(color) => {
                  onChange?.({ fillColor: color });
                }}
              />
            </PopoverContent>
          </PopoverPositioner>
        </Popover>
        <Toggle
          size="xs"
          title="Fill color ⎯ Background"
          pressed={fillColor === "$background"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$background" });
            }
          }}
        >
          <ColorItem
            value="$background"
            darkMode={darkMode}
            className="border-1 size-4 border-neutral-300 dark:border-neutral-600"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Gray"
          pressed={fillColor === "$gray4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$gray4" });
            }
          }}
        >
          <ColorItem value="$gray4" darkMode={darkMode} className="size-4" />
        </Toggle>
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Red"
          pressed={fillColor === "$red4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$red4" });
            }
          }}
        >
          <ColorItem value="$red4" darkMode={darkMode} className="size-4" />
        </Toggle>
      </div>
      <div className="flex items-center gap-1.5">
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Blue"
          pressed={fillColor === "$blue4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$blue4" });
            }
          }}
        >
          <ColorItem value="$blue4" darkMode={darkMode} className="size-4" />
        </Toggle>
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Green"
          pressed={fillColor === "$green4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$green4" });
            }
          }}
        >
          <ColorItem value="$green4" darkMode={darkMode} className="size-4" />
        </Toggle>
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Yellow"
          pressed={fillColor === "$yellow4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$yellow4" });
            }
          }}
        >
          <ColorItem value="$yellow4" darkMode={darkMode} className="size-4" />
        </Toggle>
        <Toggle
          size="xs"
          title="Fill color ⎯ Light Purple"
          pressed={fillColor === "$purple4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$purple4" });
            }
          }}
        >
          <ColorItem value="$purple4" darkMode={darkMode} className="size-4" />
        </Toggle>
      </div>
    </>
  );
}

function FillStyleTool({ selection, onChange }: ToolProps) {
  const fillStyle = merge(selection.map((s) => s.fillStyle));

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="No fill"
        pressed={fillStyle === FillStyle.NONE}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ fillStyle: FillStyle.NONE });
          }
        }}
      >
        <FillNoneIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Fill style ⎯ Hachure"
        pressed={fillStyle === FillStyle.HACHURE}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ fillStyle: FillStyle.HACHURE });
          }
        }}
      >
        <FillHachureIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Fill style ⎯ Cross Hatch"
        pressed={fillStyle === FillStyle.CROSS_HATCH}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ fillStyle: FillStyle.CROSS_HATCH });
          }
        }}
      >
        <FillCrossHatchIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Fill style ⎯ Solid"
        pressed={fillStyle === FillStyle.SOLID}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ fillStyle: FillStyle.SOLID });
          }
        }}
      >
        <FillSolidIcon size={16} />
      </Toggle>
    </div>
  );
}

function StrokeColorTool({ selection, onChange }: ToolProps) {
  const darkMode = useSettingStore((state) => state.darkMode);
  const strokeColor = merge(selection.map((s) => s.strokeColor));
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Popover modal={true}>
          <PopoverTrigger
            render={
              <Button size="icon-xs" variant="ghost" title="Stroke color" />
            }
          >
            <ColorItem
              className="size-5 rounded-sm"
              value={strokeColor ?? "$foreground"}
              darkMode={darkMode}
            />
          </PopoverTrigger>
          <PopoverPositioner side="left" align="start" sideOffset={8}>
            <PopoverContent className="w-fit text-center">
              <ColorPanel
                darkMode={darkMode}
                value={strokeColor ?? "$foreground"}
                onChange={(color) => {
                  onChange?.({ strokeColor: color });
                }}
              />
            </PopoverContent>
          </PopoverPositioner>
        </Popover>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Foreground"
          pressed={strokeColor === "$foreground"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({
                strokeColor: "$foreground",
                fontColor: "$foreground",
              });
            }
          }}
        >
          <ColorItem
            value="$foreground"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Gray"
          pressed={strokeColor === "$gray9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$gray9", fontColor: "$gray9" });
            }
          }}
        >
          <ColorItem
            value="$gray9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Red"
          pressed={strokeColor === "$red9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$red9", fontColor: "$red9" });
            }
          }}
        >
          <ColorItem
            value="$red9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
      </div>
      <div className="flex items-center gap-1.5">
        <Toggle
          size="xs"
          title="Stroke color ⎯ Blue"
          pressed={strokeColor === "$blue9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$blue9", fontColor: "$blue9" });
            }
          }}
        >
          <ColorItem
            value="$blue9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Green"
          pressed={strokeColor === "$green9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$green9", fontColor: "$green9" });
            }
          }}
        >
          <ColorItem
            value="$green9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Yellow"
          pressed={strokeColor === "$yellow9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$yellow9", fontColor: "$yellow9" });
            }
          }}
        >
          <ColorItem
            value="$yellow9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
        <Toggle
          size="xs"
          title="Stroke color ⎯ Purple"
          pressed={strokeColor === "$purple9"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ strokeColor: "$purple9", fontColor: "$purple9" });
            }
          }}
        >
          <ColorItem
            value="$purple9"
            darkMode={darkMode}
            border={true}
            className="size-4"
          />
        </Toggle>
      </div>
    </>
  );
}

function StrokeWidthTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 2;
  const selectValues = [0, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20, 28, 36];

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Thin stroke"
        pressed={strokeWidth === 2}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 2 });
        }}
      >
        <MinusIcon size={16} strokeWidth={2} />
      </Toggle>
      <Toggle
        size="xs"
        title="Medium stroke"
        pressed={strokeWidth === 4}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 4 });
        }}
      >
        <MinusIcon size={16} strokeWidth={4} />
      </Toggle>
      <Toggle
        size="xs"
        title="Thick stroke"
        pressed={strokeWidth === 6}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 6 });
        }}
      >
        <MinusIcon size={16} strokeWidth={6} />
      </Toggle>
      <Popover>
        <PopoverTrigger
          render={
            <Button size="icon-xs" variant="ghost" title="Stroke width">
              <StrokeWidthIcon size={16} />
            </Button>
          }
        ></PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs">Stroke width</div>
              <div className="flex items-center">
                <NumberField
                  title="Stroke width"
                  className="flex-grow w-14"
                  placeholder="―"
                  value={strokeWidth}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    onChange?.({ strokeWidth: value });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}

function StrokePatternAndRoughTool({ selection, onChange }: ToolProps) {
  const strokePattern = merge(
    selection.map((s) => s.strokePattern),
    true,
  );
  const stringifiedPattern = Array.isArray(strokePattern)
    ? strokePattern.length > 0
      ? strokePattern.join(",")
      : "0"
    : undefined;
  const roughness = merge(selection.map((s) => s.roughness)) ?? 0;

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Solid stroke"
        pressed={stringifiedPattern === "0"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [] });
        }}
      >
        <StrokeSolidIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Dotted stroke"
        pressed={stringifiedPattern === "0.5,2"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [0.5, 2] });
        }}
      >
        <StrokeDottedIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Dashed stroke"
        pressed={stringifiedPattern === "3,4"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [3, 4] });
        }}
      >
        <StrokeDashedIcon size={16} />
      </Toggle>
      <Popover modal={true}>
        <PopoverTrigger
          render={
            <Button
              size="icon-xs"
              variant="ghost"
              title={`Roughness ⎯ ${
                roughness <= 0 ? "None" : roughness <= 1 ? "Low" : "High"
              }`}
            />
          }
        >
          {roughness <= 0 && <RoughnessNoneIcon size={16} />}
          {roughness > 0 && roughness <= 1 && <RoughnessLowIcon size={16} />}
          {roughness > 1 && <RoughnessHighIcon size={16} />}
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0">
            <div className="flex items-center gap-1 p-1">
              <Toggle
                size="xs"
                title="No roughness"
                pressed={roughness === 0}
                onPressedChange={() => {
                  onChange?.({ roughness: 0 });
                }}
              >
                <RoughnessNoneIcon size={16} />
              </Toggle>
              <Toggle
                size="xs"
                title="Low roughness"
                pressed={roughness === 1}
                onPressedChange={() => {
                  onChange?.({ roughness: 1 });
                }}
              >
                <RoughnessLowIcon size={16} />
              </Toggle>
              <Toggle
                size="xs"
                title="High roughness"
                pressed={roughness === 2}
                onPressedChange={() => {
                  onChange?.({ roughness: 2 });
                }}
              >
                <RoughnessHighIcon size={16} />
              </Toggle>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}

function StrokeCornerAndBorderTool({ selection, onChange }: ToolProps) {
  const corners = merge(
    selection.map((s) => (s as Box).corners ?? [0, 0, 0, 0]),
    true,
  ) ?? [0, 0, 0, 0];
  const cornersValue = corners ? merge(corners) : undefined;
  const selectValues = [0, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64];
  const borders = merge(
    selection.map((s) => (s as Box).borders ?? [true, true, true, true]),
    true,
  ) ?? [true, true, true, true];
  const borderPosition = merge(
    selection.map((s) => (s as Box).borderPosition ?? "center"),
  );

  return (
    <div className="flex items-center gap-1.5">
      <Popover>
        <PopoverTrigger
          render={
            <Button size="icon-xs" variant="ghost" title="Corners">
              <MaximizeIcon size={16} />
            </Button>
          }
        ></PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-3">
            <div className="flex items-center justify-between gap-1">
              <div className="text-xs">Corner radius</div>
              <div className="flex items-center">
                <NumberField
                  title="Corner radius"
                  className="flex-grow w-20"
                  placeholder="―"
                  value={cornersValue}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    const c = corners ?? [0, 0, 0, 0];
                    onChange?.({
                      corners: [value, value, value, value],
                    });
                  }}
                />
              </div>
            </div>
            <Separator className="my-2 opacity-50" />
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <RoundedIcon
                    size={16}
                    strokeWidth={1.5}
                    className="-rotate-90"
                  />
                </Label>
                <NumberField
                  title="Left top corner"
                  className="flex-grow w-14"
                  value={corners ? corners[0] : undefined}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    const c = corners ?? [0, 0, 0, 0];
                    onChange?.({
                      corners: [value, c[1], c[2], c[3]],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <RoundedIcon size={16} strokeWidth={1.5} className="" />
                </Label>
                <NumberField
                  title="Right top corner"
                  className="flex-grow w-14"
                  value={corners ? corners[1] : undefined}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    const c = corners ?? [0, 0, 0, 0];
                    onChange?.({
                      corners: [c[0], value, c[2], c[3]],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <RoundedIcon
                    size={16}
                    strokeWidth={1.5}
                    className="-rotate-180"
                  />
                </Label>
                <NumberField
                  title="Left bottom corner"
                  className="flex-grow w-14"
                  value={corners ? corners[3] : undefined}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    const c = corners ?? [0, 0, 0, 0];
                    onChange?.({
                      corners: [c[0], c[1], c[2], value],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <RoundedIcon
                    size={16}
                    strokeWidth={1.5}
                    className="rotate-90"
                  />
                </Label>
                <NumberField
                  title="Right bottom corner"
                  className="flex-grow w-14"
                  value={corners ? corners[2] : undefined}
                  minValue={0}
                  selectValues={selectValues}
                  onChange={(value) => {
                    const c = corners ?? [0, 0, 0, 0];
                    onChange?.({
                      corners: [c[0], c[1], value, c[3]],
                    });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>

      <Popover>
        <PopoverTrigger
          render={
            <Button size="icon-xs" variant="ghost" title="Borders">
              <PaddingIndependentIcon size={16} />
            </Button>
          }
        ></PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs">Border position</div>
              <div className="flex items-center">
                <Select
                  value={borderPosition}
                  onValueChange={(value) => {
                    onChange?.({
                      borderPosition: value as BorderPositionEnum,
                    });
                  }}
                >
                  <SelectTrigger
                    className="inline-flex w-24 max-h-7 rounded-sm"
                    title="Border position"
                  >
                    <SelectValue className="text-xs" />
                  </SelectTrigger>
                  <SelectContent className="min-w-24">
                    {Object.values(BorderPosition).map((key) => (
                      <SelectItem key={key} value={key} className="text-xs h-7">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator className="my-2 opacity-50" />
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <SquareDashedTopSolidIcon size={16} strokeWidth={1.5} />
                </Label>
                <Checkbox
                  title="Top border"
                  checked={borders ? borders[0] : undefined}
                  onCheckedChange={(value) => {
                    onChange?.({
                      borders: [
                        value === true,
                        borders[1] ?? false,
                        borders[2] ?? false,
                        borders[3] ?? false,
                      ],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <SquareDashedTopSolidIcon
                    size={16}
                    strokeWidth={1.5}
                    className="rotate-90"
                  />
                </Label>
                <Checkbox
                  title="Right border"
                  checked={borders ? borders[1] : undefined}
                  onCheckedChange={(value) => {
                    onChange?.({
                      borders: [
                        borders[0] ?? false,
                        value === true,
                        borders[2] ?? false,
                        borders[3] ?? false,
                      ],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <SquareDashedTopSolidIcon
                    size={16}
                    strokeWidth={1.5}
                    className="rotate-180"
                  />
                </Label>
                <Checkbox
                  title="Bottom border"
                  checked={borders ? borders[2] : undefined}
                  onCheckedChange={(value) => {
                    onChange?.({
                      borders: [
                        borders[0] ?? false,
                        borders[1] ?? false,
                        value === true,
                        borders[3] ?? false,
                      ],
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="shape-rotate-field" className="mr-2">
                  <SquareDashedTopSolidIcon
                    size={16}
                    strokeWidth={1.5}
                    className="-rotate-90"
                  />
                </Label>
                <Checkbox
                  title="Left border"
                  checked={borders ? borders[3] : undefined}
                  onCheckedChange={(value) => {
                    onChange?.({
                      borders: [
                        borders[0] ?? false,
                        borders[1] ?? false,
                        borders[2] ?? false,
                        value === true,
                      ],
                    });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}

function FreehandWidthTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 2;

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Thin pen"
        pressed={strokeWidth === 4}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 4 });
        }}
      >
        <MinusIcon size={16} strokeWidth={2} />
      </Toggle>
      <Toggle
        size="xs"
        title="Medium pen"
        pressed={strokeWidth === 8}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 8 });
        }}
      >
        <MinusIcon size={16} strokeWidth={4} />
      </Toggle>
      <Toggle
        size="xs"
        title="Thick pen"
        pressed={strokeWidth === 16}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 16 });
        }}
      >
        <MinusIcon size={16} strokeWidth={8} />
      </Toggle>
      <Toggle
        size="xs"
        title="Extra thick pen"
        pressed={strokeWidth === 28}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 28 });
        }}
      >
        <MinusIcon size={16} strokeWidth={12} />
      </Toggle>
    </div>
  );
}

function FontFamilyTool({ selection, onChange }: ToolProps) {
  const fontFamily = merge(selection.map((s) => (s as Text).fontFamily));
  const defaultFonts = {
    sans: DEFAULT_SANS_FONT,
    serif: DEFAULT_SERIF_FONT,
    mono: DEFAULT_MONO_FONT,
    hand: DEFAULT_HAND_FONT,
  };

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Handwriting"
        className="font-medium font-hand"
        pressed={fontFamily === defaultFonts.hand}
        onPressedChange={() => {
          onChange?.({ fontFamily: defaultFonts.hand });
        }}
      >
        Aa
      </Toggle>
      <Toggle
        size="xs"
        title="Sans Serif"
        className="font-medium font-sans"
        pressed={fontFamily === defaultFonts.sans}
        onPressedChange={() => {
          onChange?.({ fontFamily: defaultFonts.sans });
        }}
      >
        Aa
      </Toggle>
      <Toggle
        size="xs"
        title="Serif"
        className="font-medium font-serif"
        pressed={fontFamily === defaultFonts.serif}
        onPressedChange={() => {
          onChange?.({ fontFamily: defaultFonts.serif });
        }}
      >
        Aa
      </Toggle>
      <Toggle
        size="xs"
        title="Monospace"
        className="font-medium font-mono"
        pressed={fontFamily === defaultFonts.mono}
        onPressedChange={() => {
          onChange?.({ fontFamily: defaultFonts.mono });
        }}
      >
        Aa
      </Toggle>
    </div>
  );
}

function FontSizeTool({ selection, onChange }: ToolProps) {
  const fontSize = merge(selection.map((s) => (s as Text).fontSize));
  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Small"
        className="font-medium"
        pressed={fontSize === 16}
        onPressedChange={() => {
          onChange?.({ fontSize: 16 });
        }}
      >
        S
      </Toggle>
      <Toggle
        size="xs"
        title="Medium"
        className="font-medium"
        pressed={fontSize === 20}
        onPressedChange={() => {
          onChange?.({ fontSize: 20 });
        }}
      >
        M
      </Toggle>
      <Toggle
        size="xs"
        title="Large"
        className="font-medium"
        pressed={fontSize === 28}
        onPressedChange={() => {
          onChange?.({ fontSize: 28 });
        }}
      >
        L
      </Toggle>
      <Toggle
        size="xs"
        title="Extra Large"
        className="font-medium"
        pressed={fontSize === 40}
        onPressedChange={() => {
          onChange?.({ fontSize: 40 });
        }}
      >
        XL
      </Toggle>
    </div>
  );
}

function TextAlignTool({ selection, onChange }: ToolProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const horzAlign = merge(selection.map((s) => (s as Box).horzAlign));
  const vertAlign = merge(selection.map((s) => (s as Box).vertAlign));

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Align text left"
        pressed={horzAlign === HorzAlign.LEFT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.LEFT });
        }}
      >
        <AlignLeftIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Align text center"
        pressed={horzAlign === HorzAlign.CENTER}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.CENTER });
        }}
      >
        <AlignCenterIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Align text right"
        pressed={horzAlign === HorzAlign.RIGHT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.RIGHT });
        }}
      >
        <AlignRightIcon size={16} />
      </Toggle>
      <Popover open={popupOpen} onOpenChange={setPopupOpen}>
        <PopoverTrigger
          render={
            <Button
              size={"icon-xs"}
              variant={"ghost"}
              title="Align text vertically"
            />
          }
        >
          {vertAlign === VertAlign.TOP && <VerticalTopIcon size={16} />}
          {vertAlign === VertAlign.MIDDLE && <VerticalMiddleIcon size={16} />}
          {vertAlign === VertAlign.BOTTOM && <VerticalBottomIcon size={16} />}
          {vertAlign === undefined && <VerticalMiddleIcon size={16} />}
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0">
            <div className="flex items-center gap-1 p-1">
              <Toggle
                size="xs"
                title="Align text top"
                pressed={vertAlign === VertAlign.TOP}
                onPressedChange={() => {
                  onChange?.({ vertAlign: VertAlign.TOP });
                  setPopupOpen(false);
                }}
              >
                <VerticalTopIcon size={16} />
              </Toggle>
              <Toggle
                size="xs"
                title="Align text middle"
                pressed={vertAlign === VertAlign.MIDDLE}
                onPressedChange={() => {
                  onChange?.({ vertAlign: VertAlign.MIDDLE });
                  setPopupOpen(false);
                }}
              >
                <VerticalMiddleIcon size={16} />
              </Toggle>
              <Toggle
                size="xs"
                title="Align text bottom"
                pressed={vertAlign === VertAlign.BOTTOM}
                onPressedChange={() => {
                  onChange?.({ vertAlign: VertAlign.BOTTOM });
                  setPopupOpen(false);
                }}
              >
                <VerticalBottomIcon size={16} />
              </Toggle>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}

function OpacityTool({ selection, onChange }: ToolProps) {
  const opacity = merge(selection.map((s) => s.opacity));

  return (
    <div className="flex items-center gap-1 py-2 px-2">
      <Slider
        title={`Opacity`}
        value={[opacity || 1]}
        min={0}
        max={1}
        step={0.1}
        className={"w-full max-w-full"}
        onValueChange={(value) => {
          onChange?.({
            opacity:
              Array.isArray(value) && value.length > 0 ? value[0] : value,
          });
        }}
      />
    </div>
  );
}

function LineTool({ selection, onChange }: ToolProps) {
  const lineType = merge(selection.map((s) => (s as Line).lineType));
  const tailEndType = merge(selection.map((s) => (s as Line).tailEndType));
  const headEndType = merge(selection.map((s) => (s as Line).headEndType));

  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        size="xs"
        title="Straight line"
        pressed={lineType === LineType.STRAIGHT}
        onPressedChange={() => {
          onChange?.({ lineType: LineType.STRAIGHT });
        }}
      >
        <LineStraightIcon size={16} />
      </Toggle>
      <Toggle
        size="xs"
        title="Curved line"
        pressed={lineType === LineType.CURVE}
        onPressedChange={() => {
          onChange?.({ lineType: LineType.CURVE });
        }}
      >
        <LineCurveIcon size={16} />
      </Toggle>
      <SelectArrowhead
        title="Arrowhead start"
        rotate={true}
        value={tailEndType}
        onValueChange={(value) => {
          onChange?.({ tailEndType: value as LineEndTypeEnum });
        }}
      />
      <SelectArrowhead
        title="Arrowhead end"
        value={headEndType}
        onValueChange={(value) => {
          onChange?.({ headEndType: value as LineEndTypeEnum });
        }}
      />
    </div>
  );
}

function LayerTool({}: ToolProps) {
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);
  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="icon-xs"
        variant="ghost"
        title={`Bring to front ⎯ ${formattedKeys["align:bring-to-front"]}`}
        onClick={() => {
          window.app.commands.execute("align:bring-to-front");
        }}
      >
        <AlignBringToFrontIcon size={16} />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        title={`Bring forward ⎯ ${formattedKeys["align:bring-forward"]}`}
        onClick={() => {
          window.app.commands.execute("align:bring-forward");
        }}
      >
        <AlignBringForwardIcon size={16} />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        title={`Send backward ⎯ ${formattedKeys["align:send-backward"]}`}
        onClick={() => {
          window.app.commands.execute("align:send-backward");
        }}
      >
        <AlignSendBackwardIcon size={16} />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        title={`Send to back ⎯ ${formattedKeys["align:send-to-back"]}`}
        onClick={() => {
          window.app.commands.execute("align:send-to-back");
        }}
      >
        <AlignSendToBackIcon size={16} />
      </Button>
    </div>
  );
}

function AlignmentTool({}: ToolProps) {
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align left ⎯ ${formattedKeys["align:align-left"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-left");
          }}
        >
          <AlignStartVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align center ⎯ ${formattedKeys["align:align-center"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-center");
          }}
        >
          <AlignCenterVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align right ⎯ ${formattedKeys["align:align-right"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-right");
          }}
        >
          <AlignEndVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Distribute horizontally ⎯ ${formattedKeys["align:distribute-horizontally"]}`}
          onClick={() => {
            window.app.commands.execute("align:distribute-horizontally");
          }}
        >
          <AlignHorizontalSpaceAroundIcon size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align top ⎯ ${formattedKeys["align:align-top"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-top");
          }}
        >
          <AlignStartHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align middle ⎯ ${formattedKeys["align:align-middle"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-middle");
          }}
        >
          <AlignCenterHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Align bottom ⎯ ${formattedKeys["align:align-bottom"]}`}
          onClick={() => {
            window.app.commands.execute("align:align-bottom");
          }}
        >
          <AlignEndHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          title={`Distribute vertically ⎯ ${formattedKeys["align:distribute-vertically"]}`}
          onClick={() => {
            window.app.commands.execute("align:distribute-vertically");
          }}
        >
          <AlignVerticalSpaceAroundIcon size={16} />
        </Button>
      </div>
    </>
  );
}

function PositionAndSizeTool({ selection, onChange }: ToolProps) {
  const left = merge(selection.map((s) => s.left));
  const top = merge(selection.map((s) => s.top));
  const width = merge(selection.map((s) => s.width));
  const height = merge(selection.map((s) => s.height));

  return (
    <>
      <div className="flex items-center gap-1.5">
        <NumberField
          className="flex-grow w-16 bg-background"
          title="X"
          label="X"
          placeholder="―"
          value={left ? Math.round(left) : undefined}
          onChange={(value) => onChange?.({ left: value })}
        />
        <NumberField
          className="flex-grow w-16 bg-background"
          title="Y"
          label="Y"
          placeholder="―"
          value={top ? Math.round(top) : undefined}
          onChange={(value) => onChange?.({ top: value })}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <NumberField
          className="flex-grow w-16 bg-background"
          title="Width"
          label="W"
          placeholder="―"
          value={width ? Math.round(width) : undefined}
          minValue={0}
          onChange={(value) => onChange?.({ width: value })}
        />
        <NumberField
          className="flex-grow w-16 bg-background"
          title="Height"
          label="H"
          placeholder="―"
          value={height ? Math.round(height) : undefined}
          minValue={0}
          onChange={(value) => onChange?.({ height: value })}
        />
      </div>
    </>
  );
}

function AdditionalTools({}: ToolProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Popover>
        <PopoverTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <PenLineIcon size={16} />
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0 text-sm">
            <div>stroke stroke</div>
            <div>roughness</div>
            <div>stroke pattern</div>
            <div>padding</div>
            <div>corners</div>
            <div>borders</div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <TypeIcon size={16} />
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0 text-sm">
            <div>font color</div>
            <div>font family</div>
            <div>font weight</div>
            <div>font size</div>
            <div>line height</div>
            <div>paragraph spacing</div>
            <div>word wrap</div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <Settings2Icon size={16} />
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0 text-sm">
            <div>shadow</div>
            <div>container</div>
            <div>lock</div>
            <div>hide</div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <Settings2Icon size={16} />
        </PopoverTrigger>
        <PopoverPositioner align="end">
          <PopoverContent className="w-fit p-0 text-xs">
            <div className="flex flex-col gap-1 p-3">
              <div className="flex items-center justify-between gap-4">
                <div>Alignment</div>
                <div>
                  <Switch />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>Position & Size</div>
                <div>
                  <Switch />
                </div>
              </div>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}
