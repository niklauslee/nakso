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
import { Separator } from "../ui/separator";
import { Shape, ShapeProps, FillStyle } from "@dgmjs/core";
import { merge } from "@/lib/utils";
import { useSettingStore } from "@/store/setting-store";
import { ColorIcon } from "./color-icon";

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

      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 border-black border-2"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 border-neutral-400 border-2"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 border-red-400 border-2"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 border-blue-400 border-2"></div>
        </Toggle>
      </div>

      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <CircleSlashIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={1.5} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={2.5} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={4} />
        </Toggle>
      </div>

      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <StrokeSolidIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <StrokeDottedIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <StrokeDashedIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <RoundedLargeIcon size={16} />
        </Toggle>
      </div>

      <Separator className="opacity-50" />

      <div className="flex items-center gap-1">
        <Toggle size="sm" className="font-medium">
          S
        </Toggle>
        <Toggle size="sm" className="font-medium">
          M
        </Toggle>
        <Toggle size="sm" className="font-medium">
          L
        </Toggle>
        <Toggle size="sm" className="font-medium">
          XL
        </Toggle>
      </div>

      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <AlignLeftIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <AlignCenterIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <AlignRightIcon size={16} />
        </Toggle>
      </div>

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
