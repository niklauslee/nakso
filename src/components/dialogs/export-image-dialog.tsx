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

import { CheckIcon, ClipboardCopyIcon, DownloadIcon } from "lucide-react";
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
import { type ExportImageFormat } from "@dgmjs/export";
import { Slider } from "@/components/ui/slider";

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
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  const handleDownload = async () => {
    const app = window.app;
    if (!exported) {
      await app.commands.execute("file:export-image", {
        shapeIdArray: app.editor.selection.getShapes().map((shape) => shape.id),
        format: exportOptions.format,
        scale: exportOptions.scale,
        dark: dark,
        fillBackground: exportOptions.fillBackground,
        margin: exportOptions.margin ?? 0,
      });
      setExported(true);
      setTimeout(() => {
        setExported(false);
      }, 3000);
    }
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
        margin: exportOptions.margin ?? 0,
      });
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
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
                value={exportOptions.margin ?? 0}
                min={0}
                max={32}
                step={4}
                onValueChange={(value) => {
                  setExportOptions({ margin: value as number });
                }}
              />
            </div>
          </div>
          {/* {exportOptions.format === "image/svg+xml" && (
            <div className="text-sm flex justify-start items-center">
              Non-builtin fonts may not display correctly.
            </div>
          )} */}
          <div className="h-9">
            {copied && (
              <div className="bg-green-100 dark:bg-green-900 text-green-500 rounded-md px-3 py-2 text-sm flex justify-start items-center">
                <CheckIcon size={16} className="mr-2" />
                Copied to clipboard!
              </div>
            )}
            {exported && (
              <div className="bg-green-100 dark:bg-green-900 text-green-500 rounded-md px-3 py-2 text-sm flex justify-start items-center">
                <CheckIcon size={16} className="mr-2" />
                Exported to the downloads folder!
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="grid grid-cols-2">
          <Button size="sm" onClick={handleDownload}>
            {exported ? (
              <CheckIcon size={16} className="" />
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
