import { Toggle } from "@/components/ui/toggle";
import {
  FillCrossHatchIcon,
  FillHachureIcon,
  FillNoneIcon,
  FillSolidIcon,
  StrokeDashedIcon,
  StrokeDottedIcon,
  StrokeSolidIcon,
  RoundedLargeIcon,
  VerticalMiddleIcon,
  VerticalTopIcon,
  VerticalBottomIcon,
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
import { useState } from "react";

interface ToolProps {
  selection: Shape[];
  onChange?: (values: ShapeProps) => void;
}

interface PaletteProps {
  selection: Shape[];
  onChange?: (values: ShapeProps) => void;
}

export function Palette({ selection, onChange }: PaletteProps) {
  return (
    <div className="absolute right-4 top-2 flex flex-col gap-2 w-40 bg-background dark:bg-neutral-900 border shadow-lg/5 rounded-lg p-2 pointer-events-auto">
      <FillColorTool selection={selection} onChange={onChange} />
      <FillStyleTool selection={selection} onChange={onChange} />

      <Separator className="opacity-50" />

      <StrokeColorTool selection={selection} onChange={onChange} />
      <StrokeWidthTool selection={selection} onChange={onChange} />
      <StrokePatternTool selection={selection} onChange={onChange} />

      <Separator className="opacity-50" />

      <FontSizeTool selection={selection} onChange={onChange} />
      <TextAlignTool selection={selection} onChange={onChange} />

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
          <EllipsisVerticalIcon size={16} />
        </Toggle>
      </div>
    </div>
  );
}

function FillColorTool({ selection, onChange }: ToolProps) {
  const darkMode = useSettingStore((state) => state.darkMode);
  const fillColor = merge(selection.map((s) => s.fillColor));
  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
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
          className="border-1"
        />
      </Toggle>
      <Toggle
        size="sm"
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
  );
}

function FillStyleTool({ selection, onChange }: ToolProps) {
  const fillStyle = merge(selection.map((s) => s.fillStyle));

  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
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
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        pressed={strokeColor === "$foreground"}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ strokeColor: "$foreground" });
          }
        }}
      >
        <ColorIcon value="$foreground" darkMode={darkMode} border={true} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeColor === "$gray9"}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ strokeColor: "$gray9" });
          }
        }}
      >
        <ColorIcon value="$gray9" darkMode={darkMode} border={true} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeColor === "$red9"}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ strokeColor: "$red9" });
          }
        }}
      >
        <ColorIcon value="$red9" darkMode={darkMode} border={true} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeColor === "$blue9"}
        onPressedChange={(pressed) => {
          if (pressed) {
            onChange?.({ strokeColor: "$blue9" });
          }
        }}
      >
        <ColorIcon value="$blue9" darkMode={darkMode} border={true} />
      </Toggle>
    </div>
  );
}

function StrokeWidthTool({ selection, onChange }: ToolProps) {
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 1;

  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        pressed={strokeWidth === 0}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 0 });
        }}
      >
        <CircleSlashIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeWidth === 1}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 1 });
        }}
      >
        <MinusIcon size={16} strokeWidth={1.5} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeWidth === 2}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 2 });
        }}
      >
        <MinusIcon size={16} strokeWidth={2.5} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={strokeWidth === 4}
        onPressedChange={() => {
          onChange?.({ strokeWidth: 4 });
        }}
      >
        <MinusIcon size={16} strokeWidth={4} />
      </Toggle>
    </div>
  );
}

function StrokePatternTool({ selection, onChange }: ToolProps) {
  const strokePattern = merge(
    selection.map((s) => s.strokePattern),
    true
  );
  const corners = merge(
    selection.map((s) => (s as Box).corners ?? [-1, -1, -1, -1]),
    true
  ) ?? [-1, -1, -1, -1];
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
        pressed={stringifiedPattern === "0"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [] });
        }}
      >
        <StrokeSolidIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={stringifiedPattern === "0.5,2"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [0.5, 2] });
        }}
      >
        <StrokeDottedIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={stringifiedPattern === "3,4"}
        onPressedChange={() => {
          onChange?.({ strokePattern: [3, 4] });
        }}
      >
        <StrokeDashedIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={stringifiedCorners === "-10,-10,-10,-10"}
        onPressedChange={(pressed) => {
          onChange?.({
            corners: pressed ? [-10, -10, -10, -10] : [0, 0, 0, 0],
          });
        }}
      >
        <RoundedLargeIcon size={16} />
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
        pressed={horzAlign === HorzAlign.LEFT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.LEFT });
        }}
      >
        <AlignLeftIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={horzAlign === HorzAlign.CENTER}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.CENTER });
        }}
      >
        <AlignCenterIcon size={16} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={horzAlign === HorzAlign.RIGHT}
        onPressedChange={() => {
          onChange?.({ horzAlign: HorzAlign.RIGHT });
        }}
      >
        <AlignRightIcon size={16} />
      </Toggle>
      <Popover open={popupOpen} onOpenChange={setPopupOpen}>
        <PopoverTrigger asChild>
          <Button size={"icon-sm"} variant={"ghost"}>
            {vertAlign === VertAlign.TOP && <VerticalTopIcon size={16} />}
            {vertAlign === VertAlign.MIDDLE && <VerticalMiddleIcon size={16} />}
            {vertAlign === VertAlign.BOTTOM && <VerticalBottomIcon size={16} />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="end">
          <div className="flex items-center gap-1 p-1">
            <Toggle
              size="sm"
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
