import { Toggle } from "@/components/ui/toggle";
import {
  FillCrossHatchIcon,
  FillHachureIcon,
  FillNoneIcon,
  FillSolidIcon,
  StrokeDashedIcon,
  StrokeDottedIcon,
  StrokeSolidIcon,
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
} from "lucide-react";
import { Separator } from "./ui/separator";

export function Palette({}) {
  return (
    <div className="absolute right-8 top-2 flex flex-col gap-2 w-40 bg-background dark:bg-neutral-900 border shadow-lg/5 rounded-lg p-2 pointer-events-auto">
      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 bg-white border-1"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 bg-neutral-200"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 bg-red-200"></div>
        </Toggle>
        <Toggle size="sm">
          <div className="rounded-sm w-4 h-4 bg-blue-200"></div>
        </Toggle>
        {/* <div className="size-8 flex items-center justify-center rounded hover:bg-neutral-100">
          <div className="rounded-full w-3.5 h-3.5 bg-white-500 border"></div>
        </div>
        <div className="size-8 flex items-center justify-center rounded hover:bg-neutral-100">
          <div className="rounded-full w-3.5 h-3.5 bg-red-500"></div>
        </div>
        <div className="size-8 flex items-center justify-center rounded hover:bg-neutral-100">
          <div className="rounded-full w-3.5 h-3.5 bg-blue-500"></div>
        </div>
        <div className="size-8 flex items-center justify-center rounded hover:bg-neutral-100">
          <div className="rounded-full w-3.5 h-3.5 bg-green-500"></div>
        </div> */}
      </div>

      <div className="flex items-center gap-1">
        <Toggle size="sm">
          <FillNoneIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <FillHachureIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <FillCrossHatchIcon size={16} />
        </Toggle>
        <Toggle size="sm">
          <FillSolidIcon size={16} />
        </Toggle>
      </div>

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
          <MinusIcon size={16} strokeWidth={1.5} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={2.5} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={4} />
        </Toggle>
        <Toggle size="sm">
          <MinusIcon size={16} strokeWidth={6} />
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
