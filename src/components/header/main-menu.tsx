import { Button } from "../ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { ApplicationMenu } from "../menu/menu";
import { useMenuStore } from "@/store/menu-store";

export function MainMenu() {
  const menus = useMenuStore((state) => state.menus);

  return (
    <ApplicationMenu
      menu={menus.main}
      className="w-fit"
      align="end"
      render={<Button size="icon-sm" variant="ghost" title="Menu" />}
    >
      <EllipsisVerticalIcon size={16} />
    </ApplicationMenu>
  );
}
