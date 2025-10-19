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
import {
  ClockIcon,
  FolderCheckIcon,
  FolderIcon,
  FolderPlusIcon,
  HeartIcon,
  PanelLeftCloseIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useExplorerStore } from "@/store/explorer-store";
import { DRAFTS_FOLDER_NAME } from "@/const";
import { useFavoritesStore } from "@/store/favorites-store";

export function AppSidebar() {
  const view = useExplorerStore((state) => state.view);
  const setView = useExplorerStore((state) => state.setView);
  const folders = useExplorerStore((state) => state.folders);
  const favoriteFiles = useFavoritesStore((state) => state.files);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);

  const handleNewFile = () => {
    window.app?.commands.execute("file:new");
  };

  return (
    <Sidebar>
      <SidebarHeader data-manual-window-drag-region className="w-full h-12">
        <div className="w-full h-full flex items-center justify-between">
          <div className="flex items-center"></div>
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="New File"
              onClick={handleNewFile}
            >
              <PlusIcon size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="New Folder"
              onClick={() => {
                console.log("New Folder");
              }}
            >
              <FolderPlusIcon size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="New File"
              onClick={() =>
                window.app?.commands.execute("view:toggle-sidebar")
              }
            >
              <PanelLeftCloseIcon size={16} />
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
                  onClick={() => setView("search")}
                  asChild
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
                  onClick={() => setView("recents")}
                  asChild
                >
                  <a href="#">
                    <ClockIcon size={16} />
                    <span>Recents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "favorites"}
                  onClick={() => setView("favorites")}
                  asChild
                >
                  <a href="#">
                    <HeartIcon size={16} />
                    <span>Favorites</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge className="text-muted-foreground">
                  {favoriteFiles.length}
                </SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "trash"}
                  onClick={() => setView("trash")}
                  asChild
                >
                  <a href="#">
                    <Trash2Icon size={16} />
                    <span>Trash</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "settings"}
                  onClick={() => setView("settings")}
                  asChild
                >
                  <a href="#">
                    <SettingsIcon size={16} />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          {/* <SidebarGroupAction title="Add Folder">
            <FolderPlusIcon size={16} />{" "}
            <span className="sr-only">Add Folder</span>
          </SidebarGroupAction> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.name}>
                  <SidebarMenuButton
                    isActive={
                      view === "folder" && folder.fullPath === currentFolder
                    }
                    onClick={() => {
                      setCurrentFolder(folder.fullPath);
                      setView("folder");
                    }}
                    asChild
                  >
                    <a href="#">
                      {folder.name === DRAFTS_FOLDER_NAME ? (
                        <FolderCheckIcon size={16} />
                      ) : (
                        <FolderIcon size={16} />
                      )}
                      <span>{folder.name}</span>
                    </a>
                  </SidebarMenuButton>
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
