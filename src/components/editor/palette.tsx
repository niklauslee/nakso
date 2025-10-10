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
  RoundedIcon,
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
  CircleEllipsisIcon,
  EllipsisIcon,
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
import { useKeymapStore } from "@/store/keymap-store";
import { Slider } from "@/components/ui/slider";

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
    <div className="absolute right-4 top-4 flex flex-col gap-2 w-40 bg-background dark:bg-neutral-900 border shadow-lg/5 rounded-lg p-2 pointer-events-auto">
      <FillColorTool selection={selection} onChange={onChange} />
      <FillStyleTool selection={selection} onChange={onChange} />
      <OpacityTool selection={selection} onChange={onChange} />
      <Separator className="opacity-50" />
      <StrokeColorTool selection={selection} onChange={onChange} />
      <StrokeWidthTool selection={selection} onChange={onChange} />
      <StrokePatternTool selection={selection} onChange={onChange} />
      <Separator className="opacity-50" />
      <FontSizeTool selection={selection} onChange={onChange} />
      <TextAlignTool selection={selection} onChange={onChange} />
      <Separator className="opacity-50" />

      <LayerTool selection={selection} onChange={onChange} />
      <AlignmentTool selection={selection} onChange={onChange} />

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
            className="border-1"
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
        <Button size="icon-sm" variant="ghost" title="More colors">
          <EllipsisVerticalIcon size={16} />
        </Button>
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

function OpacityTool({}: ToolProps) {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      <Slider
        title="Opacity"
        defaultValue={[1]}
        min={0}
        max={1}
        step={0.1}
        className={"w-full"}
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
              onChange?.({ strokeColor: "$foreground" });
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
              onChange?.({ strokeColor: "$gray9" });
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
              onChange?.({ strokeColor: "$red9" });
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
              onChange?.({ strokeColor: "$blue9" });
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
              onChange?.({ strokeColor: "$green9" });
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
              onChange?.({ strokeColor: "$yellow9" });
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
              onChange?.({ strokeColor: "$purple9" });
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
  const strokeWidth = merge(selection.map((s) => s.strokeWidth)) ?? 1;

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
        <RoundedIcon size={16} />
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

function LayerTool({}: ToolProps) {
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Bring to front ⎯ ${formattedKeys["align:bring-to-front"]}`}
      >
        <AlignBringToFrontIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Bring forward ⎯ ${formattedKeys["align:bring-forward"]}`}
      >
        <AlignBringForwardIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Send backward ⎯ ${formattedKeys["align:send-backward"]}`}
      >
        <AlignSendBackwardIcon size={16} />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        title={`Send to back ⎯ ${formattedKeys["align:send-to-back"]}`}
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
        <Button size="icon-sm" variant="ghost" title="Align left">
          <AlignStartVerticalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Align center">
          <AlignCenterVerticalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Align right">
          <AlignEndVerticalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Distribute horizontally">
          <AlignHorizontalSpaceAroundIcon size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" title="Align top">
          <AlignStartHorizontalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Align middle">
          <AlignCenterHorizontalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Align bottom">
          <AlignEndHorizontalIcon size={16} />
        </Button>
        <Button size="icon-sm" variant="ghost" title="Distribute vertically">
          <AlignVerticalSpaceAroundIcon size={16} />
        </Button>
      </div>
    </>
  );
}
