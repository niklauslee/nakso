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

import { useMenuStore } from "../../store/menu-store";
import { ApplicationMenu } from "@/components/menu/menu";
import { Button } from "@/components/ui/button";

export function HelpTool() {
  const helpMenu = useMenuStore((state) => state.menus.help);

  return (
    <div className="fixed right-4 bottom-4 z-10 flex justify-center gap-2">
      <ApplicationMenu menu={helpMenu} align="end">
        <Button
          variant="ghost"
          title="Help"
          className="text-sm h-8 w-8 bg-accent rounded-full shadow-md"
        >
          ?
        </Button>
      </ApplicationMenu>
    </div>
  );
}
