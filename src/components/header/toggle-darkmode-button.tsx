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

import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingStore } from "@/store/setting-store";
import { type ComponentProps } from "react";

export function ToggleDarkModeButton({
  ...props
}: ComponentProps<typeof Button>) {
  const darkMode = useSettingStore((state) => state.darkMode);

  const handleToggleDarkMode = () => {
    window.app?.commands.execute("view:dark-mode");
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onMouseDownCapture={(e) => e.stopPropagation()}
      onClick={handleToggleDarkMode}
      title="Toggle Dark Mode"
      {...props}
    >
      {darkMode ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </Button>
  );
}
