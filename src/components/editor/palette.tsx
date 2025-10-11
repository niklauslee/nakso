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
} from "@/components/icons";
import {
  EllipsisVerticalIcon,
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
  ChevronRightIcon,
  Settings2Icon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Shape,
  ShapeProps,
  FillStyle,
  Box,
  Text,
  HorzAlign,
  VertAlign,
  Line,
  LineEndTypeEnum,
  LineType,
} from "@dgmjs/core";
import { merge } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { ColorIcon } from "./color-icon";
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
import { de } from "zod/v4/locales";

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

  const hasRectangle = hasShapeType(tool, selection, "Rectangle");
  const hasEllipse = hasShapeType(tool, selection, "Ellipse");
  const hasText = hasShapeType(tool, selection, "Text");
  const hasImage = hasShapeType(tool, selection, "Image");
  const hasIcon = hasShapeType(tool, selection, "Icon");
  const hasGroup = hasShapeType(tool, selection, "Group");
  const hasFrame = hasShapeType(tool, selection, "Frame");
  const hasLine = hasShapeType(tool, selection, "Line");
  const hasClosedLine = selection.some(
    (s) => s instanceof Line && s.isClosed()
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

  // don't show palette when no selection and not shape tool
  if (!hasSelection && !isShapeTool(tool)) {
    return null;
  }

  return (
    <div ref={outerRef} className="absolute top-4 bottom-4 right-4 w-40 z-10">
      <ScrollArea
        ref={scrollRef}
        className="w-full max-h-full bg-background dark:bg-sidebar border shadow-lg/5 rounded-lg"
      >
        <div ref={innerRef} className="flex flex-col gap-2 w-full h-fit p-2">
          {(hasRectangle || hasEllipse || hasFrame || hasClosedLine) && (
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
              <StrokeWidthTool selection={selection} onChange={onChange} />
              <StrokePatternAndCornerTool
                selection={selection}
                onChange={onChange}
              />
            </>
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
              <div className="flex items-center gap-1">
                <Toggle size="sm">
                  <PaintBucketIcon size={16} />
                </Toggle>
                <Toggle size="sm">
                  <PenLineIcon size={16} />
                </Toggle>
                <Toggle size="sm">
                  <TypeIcon size={16} />
                </Toggle>
                <Toggle size="sm">
                  <Settings2Icon size={16} />
                </Toggle>
              </div>
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
          <ColorIcon
            value="$background"
            darkMode={darkMode}
            className="border-1 border-neutral-300 dark:border-neutral-600"
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
          <ColorIcon value="$gray4" darkMode={darkMode} />
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
          <ColorIcon value="$red4" darkMode={darkMode} />
        </Toggle>
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
          <ColorIcon value="$blue4" darkMode={darkMode} />
        </Toggle>
      </div>
      <div className="flex items-center gap-1">
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
          <ColorIcon value="$green4" darkMode={darkMode} />
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
          <ColorIcon value="$yellow4" darkMode={darkMode} />
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
          <ColorIcon value="$purple4" darkMode={darkMode} />
        </Toggle>
        <Toggle
          size="sm"
          title="Fill color ⎯ Light Orange"
          pressed={fillColor === "$orange4"}
          onPressedChange={(pressed) => {
            if (pressed) {
              onChange?.({ fillColor: "$orange4" });
            }
          }}
        >
          <ColorIcon value="$orange4" darkMode={darkMode} />
        </Toggle>
        {/* <Button size="icon-sm" variant="ghost" title="More colors">
          <EllipsisVerticalIcon size={16} />
        </Button> */}
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

function StrokeColorTool({ selection, onChange }: ToolProps) {
  const darkMode = useSettingStore((state) => state.darkMode);
  const strokeColor = merge(selection.map((s) => s.strokeColor));
  return (
    <>
      <div className="flex items-center gap-1">
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
          <ColorIcon value="$foreground" darkMode={darkMode} border={true} />
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
          <ColorIcon value="$gray9" darkMode={darkMode} border={true} />
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
          <ColorIcon value="$red9" darkMode={darkMode} border={true} />
        </Toggle>
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
          <ColorIcon value="$blue9" darkMode={darkMode} border={true} />
        </Toggle>
      </div>
      <div className="flex items-center gap-1">
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
          <ColorIcon value="$green9" darkMode={darkMode} border={true} />
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
          <ColorIcon value="$yellow9" darkMode={darkMode} border={true} />
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
          <ColorIcon value="$purple9" darkMode={darkMode} border={true} />
        </Toggle>
        <Button size="icon-sm" variant="ghost" title="More colors">
          <EllipsisVerticalIcon size={16} />
        </Button>
      </div>
    </>
  );
}

function StrokeWidthTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 2;
  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        title="No stroke"
        pressed={strokeWidth === 0}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 0 });
        }}
      >
        <CircleSlashIcon size={16} />
      </Toggle>
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
        <MinusIcon size={16} strokeWidth={3.5} />
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
    </div>
  );
}

function StrokePatternAndCornerTool({ selection, onChange }: ToolProps) {
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
        <Toggle
          size="sm"
          title="Rounded corners"
          pressed={stringifiedCorners === "-10,-10,-10,-10"}
          onPressedChange={(pressed) => {
            onChange?.({
              corners: pressed ? [-10, -10, -10, -10] : [0, 0, 0, 0],
            });
          }}
        >
          <RoundedLargeIcon size={16} />
        </Toggle>
      )}
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
