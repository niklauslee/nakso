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
  RoundedLargeIcon,
  LineStraightIcon,
  LineCurveIcon,
  RoundedIcon,
  RoundedNoneIcon,
  RoundedSmallIcon,
  RoughnessLowIcon,
  RoughnessNoneIcon,
  RoughnessHighIcon,
} from "@/components/icons";
import {
  PaintBucketIcon,
  PenLineIcon,
  TypeIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  MinusIcon,
  CircleSlashIcon,
  AlignStartVerticalIcon,
  AlignCenterVerticalIcon,
  AlignEndVerticalIcon,
  AlignHorizontalSpaceAroundIcon,
  AlignStartHorizontalIcon,
  AlignCenterHorizontalIcon,
  AlignEndHorizontalIcon,
  AlignVerticalSpaceAroundIcon,
  Settings2Icon,
  SettingsIcon,
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
} from "@dgmjs/core";
import { cn, merge } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
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
  type: string
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
    (s) => s instanceof Path && s.isClosed()
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
        "absolute top-4 bottom-4 right-4 w-40 z-10 pointer-events-none",
        !isVisible && "hidden"
      )}
    >
      <ScrollArea
        ref={scrollRef}
        className="w-full max-h-full bg-background dark:bg-sidebar border shadow-lg/5 rounded-lg pointer-events-auto"
      >
        <div ref={innerRef} className="flex flex-col gap-2 w-full h-fit p-2">
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
            hasFrame ||
            hasLine ||
            hasConnector) && (
            <>
              <StrokeWidthAndRoughTool
                selection={selection}
                onChange={onChange}
              />
              <StrokePatternAndCornerTool
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

          {(hasRectangle || hasEllipse || hasText) && (
            <>
              <Separator className="opacity-50" />
              <FontFamilyTool selection={selection} onChange={onChange} />
              <FontSizeTool selection={selection} onChange={onChange} />
              <TextAlignTool selection={selection} onChange={onChange} />
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

          {hasSelection && (
            <>
              <Separator className="opacity-50" />
              <AdditionalTools selection={selection} onChange={onChange} />
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
      <div className="flex items-center gap-1">
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button size="icon-sm" variant="ghost" title="Fill color">
              <ColorItem
                className="rounded-sm size-6 border-1 border-neutral-300 dark:border-neutral-600"
                value={fillColor ?? "$background"}
                darkMode={darkMode}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={8}
            className="w-fit text-center"
          >
            <ColorPanel
              darkMode={darkMode}
              value={fillColor ?? "$background"}
              onChange={(color) => {
                onChange?.({ fillColor: color });
              }}
            />
          </PopoverContent>
        </Popover>
        <Toggle
          size="sm"
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
          size="sm"
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
          size="sm"
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
      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
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
          size="sm"
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
          size="sm"
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
          size="sm"
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
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
        size="sm"
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
        size="sm"
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
        size="sm"
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
      <div className="flex items-center gap-1">
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button size="icon-sm" variant="ghost" title="Stroke color">
              <ColorItem
                className="size-6 rounded-sm"
                value={strokeColor ?? "$foreground"}
                darkMode={darkMode}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={8}
            className="w-fit text-center"
          >
            <ColorPanel
              darkMode={darkMode}
              value={strokeColor ?? "$foreground"}
              onChange={(color) => {
                onChange?.({ strokeColor: color });
              }}
            />
          </PopoverContent>
        </Popover>
        <Toggle
          size="sm"
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
          size="sm"
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
          size="sm"
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
      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
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
          size="sm"
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
          size="sm"
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
          size="sm"
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

function StrokeWidthAndRoughTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 2;
  const roughness = merge(selection.map((s) => s.roughness)) ?? 0;

  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        title="Thin stroke"
        pressed={strokeWidth === 2}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 2 });
        }}
      >
        <MinusIcon size={16} strokeWidth={2} />
      </Toggle>
      <Toggle
        size="sm"
        title="Medium stroke"
        pressed={strokeWidth === 4}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 4 });
        }}
      >
        <MinusIcon size={16} strokeWidth={4} />
      </Toggle>
      <Toggle
        size="sm"
        title="Thick stroke"
        pressed={strokeWidth === 6}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 6 });
        }}
      >
        <MinusIcon size={16} strokeWidth={6} />
      </Toggle>

      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            title={`Roughness ⎯ ${
              roughness <= 0 ? "None" : roughness <= 1 ? "Low" : "High"
            }`}
          >
            {roughness <= 0 && <RoughnessNoneIcon size={16} />}
            {roughness > 0 && roughness <= 1 && <RoughnessLowIcon size={16} />}
            {roughness > 1 && <RoughnessHighIcon size={16} />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="end">
          <div className="flex items-center gap-1 p-1">
            <Toggle
              size="sm"
              title="No roughness"
              pressed={roughness === 0}
              onPressedChange={() => {
                onChange?.({ roughness: 0 });
              }}
            >
              <RoughnessNoneIcon size={16} />
            </Toggle>
            <Toggle
              size="sm"
              title="Low roughness"
              pressed={roughness === 1}
              onPressedChange={() => {
                onChange?.({ roughness: 1 });
              }}
            >
              <RoughnessLowIcon size={16} />
            </Toggle>
            <Toggle
              size="sm"
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
      </Popover>
    </div>
  );
}

function StrokePatternAndCornerTool({ selection, onChange }: ToolProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const tool = useEditorStore((state) => state.activeHandler);
  const hasRectangle = hasShapeType(tool, selection, "Rectangle");
  const hasFrame = hasShapeType(tool, selection, "Frame");

  const strokePattern = merge(
    selection.map((s) => s.strokePattern),
    true
  );
  const corners = merge(
    selection.map((s) => (s as Box).corners ?? [0, 0, 0, 0]),
    true
  ) ?? [0, 0, 0, 0];
  const stringifiedPattern = Array.isArray(strokePattern)
    ? strokePattern.length > 0
      ? strokePattern.join(",")
      : "0"
    : undefined;
  const stringifiedCorners = corners.join(",");

  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        title="Solid stroke"
        pressed={stringifiedPattern === "0"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [] });
        }}
      >
        <StrokeSolidIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        title="Dotted stroke"
        pressed={stringifiedPattern === "0.5,2"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [0.5, 2] });
        }}
      >
        <StrokeDottedIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        title="Dashed stroke"
        pressed={stringifiedPattern === "3,4"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [3, 4] });
        }}
      >
        <StrokeDashedIcon size={16} />
      </Toggle>
      {(hasRectangle || hasFrame) && (
        <Popover open={popupOpen} onOpenChange={setPopupOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              title={`Rounded ⎯ ${
                stringifiedCorners === "0,0,0,0"
                  ? "None"
                  : stringifiedCorners === "8,8,8,8"
                  ? "Small"
                  : stringifiedCorners === "16,16,16,16"
                  ? "Large"
                  : stringifiedCorners === "-50,-50,-50,-50"
                  ? "Full"
                  : "Custom"
              }`}
            >
              {stringifiedCorners === "0,0,0,0" && (
                <RoundedNoneIcon size={16} />
              )}
              {stringifiedCorners === "8,8,8,8" && (
                <RoundedSmallIcon size={16} />
              )}
              {stringifiedCorners === "16,16,16,16" && (
                <RoundedIcon size={16} />
              )}
              {stringifiedCorners === "-50,-50,-50,-50" && (
                <RoundedLargeIcon size={16} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-0" align="end">
            <div className="flex items-center gap-1 p-1">
              <Toggle
                size="sm"
                title="No rounded corners"
                pressed={stringifiedCorners === "0,0,0,0"}
                onPressedChange={() => {
                  onChange?.({ corners: [0, 0, 0, 0] });
                  setPopupOpen(false);
                }}
              >
                <RoundedNoneIcon size={16} />
              </Toggle>
              <Toggle
                size="sm"
                title="Small rounded corners"
                pressed={stringifiedCorners === "8,8,8,8"}
                onPressedChange={() => {
                  onChange?.({ corners: [8, 8, 8, 8] });
                  setPopupOpen(false);
                }}
              >
                <RoundedSmallIcon size={16} />
              </Toggle>
              <Toggle
                size="sm"
                title="Large rounded corners"
                pressed={stringifiedCorners === "16,16,16,16"}
                onPressedChange={() => {
                  onChange?.({ corners: [16, 16, 16, 16] });
                  setPopupOpen(false);
                }}
              >
                <RoundedIcon size={16} />
              </Toggle>
              <Toggle
                size="sm"
                title="Fully rounded corners"
                pressed={stringifiedCorners === "-50,-50,-50,-50"}
                onPressedChange={() => {
                  onChange?.({ corners: [-50, -50, -50, -50] });
                  setPopupOpen(false);
                }}
              >
                <RoundedLargeIcon size={16} />
              </Toggle>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function FreehandWidthTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 2;

  return (
    <div className="flex items-center gap-1 py-2 px-1">
      <Toggle
        size="sm"
        title="Thin pen"
        pressed={strokeWidth === 4}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 4 });
        }}
      >
        <MinusIcon size={16} strokeWidth={2} />
      </Toggle>
      <Toggle
        size="sm"
        title="Medium pen"
        pressed={strokeWidth === 8}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 8 });
        }}
      >
        <MinusIcon size={16} strokeWidth={4} />
      </Toggle>
      <Toggle
        size="sm"
        title="Thick pen"
        pressed={strokeWidth === 16}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 16 });
        }}
      >
        <MinusIcon size={16} strokeWidth={8} />
      </Toggle>
      <Toggle
        size="sm"
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
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
        size="sm"
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
        size="sm"
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
        size="sm"
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
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
        size="sm"
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
        size="sm"
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
        size="sm"
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        title="Align text left"
        pressed={horzAlign === HorzAlign.LEFT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.LEFT });
        }}
      >
        <AlignLeftIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        title="Align text center"
        pressed={horzAlign === HorzAlign.CENTER}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.CENTER });
        }}
      >
        <AlignCenterIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        title="Align text right"
        pressed={horzAlign === HorzAlign.RIGHT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.RIGHT });
        }}
      >
        <AlignRightIcon size={16} />
      </Toggle>
      <Popover open={popupOpen} onOpenChange={setPopupOpen}>
        <PopoverTrigger asChild>
          <Button
            size={"icon-sm"}
            variant={"ghost"}
            title="Align text vertically"
          >
            {vertAlign === VertAlign.TOP && <VerticalTopIcon size={16} />}
            {vertAlign === VertAlign.MIDDLE && <VerticalMiddleIcon size={16} />}
            {vertAlign === VertAlign.BOTTOM && <VerticalBottomIcon size={16} />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="end">
          <div className="flex items-center gap-1 p-1">
            <Toggle
              size="sm"
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
              size="sm"
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
              size="sm"
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
      </Popover>
    </div>
  );
}

function OpacityTool({ selection, onChange }: ToolProps) {
  const opacity = merge(selection.map((s) => s.opacity));

  return (
    <div className="flex items-center gap-1 py-2 px-1">
      <Slider
        title={`Opacity`}
        value={[opacity || 1]}
        min={0}
        max={1}
        step={0.1}
        className={"w-full"}
        onValueChange={(value) => {
          onChange?.({ opacity: value.length > 0 ? value[0] : 1 });
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        title="Straight line"
        pressed={lineType === LineType.STRAIGHT}
        onPressedChange={() => {
          onChange?.({ lineType: LineType.STRAIGHT });
        }}
      >
        <LineStraightIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
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
    <div className="flex items-center gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Bring to front ⎯ ${formattedKeys["align:bring-to-front"]}`}
        onClick={() => {
          window.app.commands.execute("align:bring-to-front");
        }}
      >
        <AlignBringToFrontIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Bring forward ⎯ ${formattedKeys["align:bring-forward"]}`}
        onClick={() => {
          window.app.commands.execute("align:bring-forward");
        }}
      >
        <AlignBringForwardIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Send backward ⎯ ${formattedKeys["align:send-backward"]}`}
        onClick={() => {
          window.app.commands.execute("align:send-backward");
        }}
      >
        <AlignSendBackwardIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
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
  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align left"
          onClick={() => {
            window.app.commands.execute("align:align-left");
          }}
        >
          <AlignStartVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align center"
          onClick={() => {
            window.app.commands.execute("align:align-center");
          }}
        >
          <AlignCenterVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align right"
          onClick={() => {
            window.app.commands.execute("align:align-right");
          }}
        >
          <AlignEndVerticalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Distribute horizontally"
          onClick={() => {
            window.app.commands.execute("align:distribute-horizontally");
          }}
        >
          <AlignHorizontalSpaceAroundIcon size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align top"
          onClick={() => {
            window.app.commands.execute("align:align-top");
          }}
        >
          <AlignStartHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align middle"
          onClick={() => {
            window.app.commands.execute("align:align-middle");
          }}
        >
          <AlignCenterHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Align bottom"
          onClick={() => {
            window.app.commands.execute("align:align-bottom");
          }}
        >
          <AlignEndHorizontalIcon size={16} />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Distribute vertically"
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

function AdditionalTools({}: ToolProps) {
  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <PenLineIcon size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0 text-sm" align="end">
          <div>stroke stroke</div>
          <div>roughness</div>
          <div>stroke pattern</div>
          <div>padding</div>
          <div>corners</div>
          <div>borders</div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <TypeIcon size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0 text-sm" align="end">
          <div>font color</div>
          <div>font family</div>
          <div>font weight</div>
          <div>font size</div>
          <div>line height</div>
          <div>paragraph spacing</div>
          <div>word wrap</div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <Settings2Icon size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0 text-sm" align="end">
          <div>shadow</div>
          <div>container</div>
          <div>lock</div>
          <div>hide</div>
        </PopoverContent>
      </Popover>

      <Button size="icon-sm" variant="ghost">
        <SettingsIcon size={16} />
      </Button>
    </div>
  );
}
