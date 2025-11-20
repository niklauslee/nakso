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

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import packageJson from "../../../package.json";
import { LogoIcon } from "@/components/icons";

export interface AboutDialogState {
  open: boolean;
  show: (open: boolean) => void;
}

export const useAboutDialog = create<AboutDialogState>()(
  devtools(
    (set, get) => ({
      open: false,
      show: (open) => {
        set((state) => ({ open }));
      },
    }),
    { name: "AboutDialogStore" }
  )
);

export function AboutDialog({}) {
  const { open, show } = useAboutDialog();

  return (
    <Dialog open={open} onOpenChange={(open) => show(open)}>
      <DialogContent className="w-full h-52 md:w-64" title="About">
        <DialogHeader>
          <DialogTitle className="hidden">About</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center">
            <LogoIcon size={48} />
          </div>
          <div className="text-sm font-medium text-center">
            {packageJson.productName}
          </div>
          <div className="text-xs flex items-center justify-center">
            <a
              href="https://nakso.app"
              className="text-blue-500 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                window.app.openExternalLink("https://nakso.app");
              }}
            >
              https://nakso.app
            </a>
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            Version {packageJson.version}
          </div>
          <div className="text-xs text-center text-muted-foreground">
            Copyright © MKLabs Co., Ltd.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
