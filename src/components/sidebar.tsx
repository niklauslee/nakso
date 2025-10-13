import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/store/app-store";
import {
  ClockIcon,
  FolderCheckIcon,
  FolderIcon,
  FolderPlusIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useWorkingStore } from "@/store/working-store";
import { DRAFTS_DIR_NAME } from "@/api/workspace";
import { useExplorerStore } from "@/store/explorer-store";

export function AppSidebar() {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const folders = useExplorerStore((state) => state.folders);
  const workingFolder = useWorkingStore((state) => state.workingFolder);
  const setWorkingFolder = useWorkingStore((state) => state.setWorkingFolder);

  return (
    <Sidebar>
      <SidebarHeader data-manual-window-drag-region className="w-full h-12">
        <div className="w-full h-full flex items-center justify-between">
          <div className="flex items-center"></div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="New File"
            >
              <PlusIcon size={16} />
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "search"}
                  asChild
                  onClick={() => setView("search")}
                >
                  <a href="#">
                    <SearchIcon size={16} />
                    <span>Search</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "recents"}
                  asChild
                  onClick={() => setView("recents")}
                >
                  <a href="#">
                    <ClockIcon size={16} />
                    <span>Recents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <StarIcon size={16} />
                    <span>Favorites</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge>22</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem onClick={() => setView("editor")}>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Trash2Icon size={16} />
                    <span>Trash</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge>0</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupAction title="Add Folder">
            <FolderPlusIcon size={16} />{" "}
            <span className="sr-only">Add Folder</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.name}>
                  <SidebarMenuButton
                    isActive={folder.fullPath === workingFolder}
                    onClick={() => {
                      setWorkingFolder(folder.fullPath);
                      setView("folder");
                    }}
                    asChild
                  >
                    <a href="#">
                      {folder.name === DRAFTS_DIR_NAME ? (
                        <FolderCheckIcon size={16} />
                      ) : (
                        <FolderIcon size={16} />
                      )}
                      <span>{folder.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>0</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
