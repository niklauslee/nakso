/*
 * Copyright (c) 2023 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import {
  CheckIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingStore } from "../../store/setting-store";
import { useState } from "react";
import {
  ExportImageOptions,
  getImageBlob,
  getSVGImageData,
  type ExportImageFormat,
} from "@dgmjs/export";
import { getFontsInStyle, useFontStore } from "@/store/font-store";
import { SITE_URL } from "@/const";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
// import { extractFileName, findUniqueFilePath } from "./dialog-utils";
// import { Info } from "@/components/ui/info";
// import { postrenderWatermark } from "@/shape-utils";

export interface ExportImageDialogState {
  open: boolean;
  show: (open: boolean) => void;
}

export const useExportImageDialog = create<ExportImageDialogState>()(
  devtools(
    (set, get) => ({
      open: false,
      show: (open) => {
        set((state) => ({ open }));
      },
    }),
    { name: "ExportImageDialogStore" }
  )
);

export function ExportImageDialog({}) {
  const dark = useSettingStore((state) => state.darkMode);
  const exportOptions = useSettingStore((state) => state.exportImageOptions);
  const setExportOptions = useSettingStore(
    (state) => state.setExportImageOptions
  );
  const { open, show } = useExportImageDialog();
  // const filePath = useDocStore((state) => state.filePath);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fonts = useFontStore((state) => state.fonts);
  const builtinFonts = fonts.filter((font) => font.builtin);

  const handleDownload = async () => {
    // const app = window.app;
    // const api = window.api;
    // const canvas = app.editor.canvas;
    // const page = app.editor.getCurrentPage()!;
    // const shapes = app.editor.selection.getShapes();
    // // Find unique export file name in download folder
    // const downloadsPath = await api.fs.getPath("downloads");
    // const fileName = await extractFileName(filePath);
    // const exportPath = await findUniqueFilePath(
    //   downloadsPath,
    //   fileName,
    //   getExt(exportOptions)
    // );
    // if (exportPath) {
    //   try {
    //     setLoading(true);
    //     switch (exportOptions.format) {
    //       case "image/png":
    //       case "image/jpeg":
    //       case "image/webp": {
    //         const data = await getImageBlob(canvas, page, shapes, {
    //           ...exportOptions,
    //           dark: dark,
    //           postrender: postrenderWatermark,
    //         });
    //         const arrayBuffer = await data.arrayBuffer();
    //         api.fs.writeArrayBuffer(exportPath, arrayBuffer);
    //         toast("Exported to the downloads folder", {
    //           action: {
    //             label: "Open",
    //             onClick: () => api.window.openPath(downloadsPath),
    //           },
    //         });
    //         setLoading(false);
    //         break;
    //       }
    //       case "image/svg+xml": {
    //         const data = await getSVGImageData(
    //           canvas,
    //           page,
    //           shapes,
    //           { ...exportOptions, dark: dark, postrender: postrenderWatermark },
    //           getFontsInStyle(builtinFonts, SITE_URL)
    //         );
    //         api.fs.write(exportPath, data);
    //         toast("Exported to the downloads folder", {
    //           action: {
    //             label: "Open",
    //             onClick: () => api.window.openPath(downloadsPath),
    //           },
    //         });
    //         setLoading(false);
    //         break;
    //       }
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     toast.error("Failed to export image");
    //     setLoading(false);
    //   }
    // }
  };

  const handleCopyImageToClipboard = () => {
    const app = window.app;
    if (!copied) {
      app.commands.execute("edit:copy-image-to-clipboard", {
        shapeIdArray: app.editor.selection.getShapes().map((shape) => shape.id),
        format: exportOptions.format,
        scale: exportOptions.scale,
        dark: dark,
        fillBackground: exportOptions.fillBackground,
        margin: exportOptions.margin,
      });
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => show(open)}>
      <DialogContent className="w-[420px]" title="Export image">
        <DialogHeader>
          <DialogTitle className="text-sm">Export Image</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-9">
            <Label htmlFor="export-image-fill-background">
              Fill background
            </Label>
            <Switch
              id="export-image-fill-background"
              checked={exportOptions.fillBackground}
              onCheckedChange={(checked) =>
                setExportOptions({ fillBackground: checked })
              }
            ></Switch>
          </div>
          <div className="flex items-center justify-between h-9">
            <Label>Format</Label>
            <Tabs
              value={exportOptions.format}
              onValueChange={(value) =>
                setExportOptions({
                  format: value as ExportImageFormat,
                })
              }
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="image/png">PNG</TabsTrigger>
                <TabsTrigger value="image/jpeg">JPEG</TabsTrigger>
                <TabsTrigger value="image/webp">WebP</TabsTrigger>
                <TabsTrigger value="image/svg+xml">SVG</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center justify-between h-9">
            <Label>Scale</Label>
            <Tabs
              value={exportOptions.scale.toString()}
              onValueChange={(value) =>
                setExportOptions({ scale: parseInt(value) })
              }
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="1">1x</TabsTrigger>
                <TabsTrigger value="2">2x</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center justify-between h-9">
            <Label>Margin</Label>
            <div className="w-40">
              <Slider
                value={[exportOptions.margin]}
                min={0}
                max={32}
                step={4}
                onValueChange={(value) => {
                  setExportOptions({ margin: (value as number[])[0] });
                }}
              />
            </div>
          </div>
          {exportOptions.format === "image/svg+xml" && (
            <div className="text-xs flex justify-end items-center">
              {/* <Info className="w-full flex justify-start">
                Non-builtin fonts may not display correctly.
              </Info> */}
            </div>
          )}
        </div>
        <DialogFooter className="grid grid-cols-2 mt-2">
          <Button size="sm" onClick={handleDownload}>
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <DownloadIcon size={16} className="" />
            )}
            Export
          </Button>
          <Button
            size="sm"
            disabled={exportOptions.format === "image/svg+xml"}
            onClick={handleCopyImageToClipboard}
          >
            {copied ? (
              <CheckIcon size={16} className="" />
            ) : (
              <ClipboardCopyIcon size={16} className="" />
            )}
            Copy to clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getExt(exportOptions: ExportImageOptions): string {
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
