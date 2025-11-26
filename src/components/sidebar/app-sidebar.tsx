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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ClockIcon,
  FolderPlusIcon,
  HeartIcon,
  PanelLeftCloseIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useExplorerStore } from "@/store/explorer-store";
import { FAVORITES_TAG, RECENTS_TAG, SEARCH_TAG, TRASH_TAG } from "@/const";
import { useFavoritesStore } from "@/store/favorites-store";
import { workspace } from "@/api/workspace";
import { useSettingStore } from "@/store/setting-store";
import { useEffect } from "react";
import { TauriDragRegion } from "../common/tauri-drag-region";
import { FolderTreeView } from "./folder-tree-view";

export function AppSidebar() {
  const showSidebar = useSettingStore((state) => state.showSidebar);
  const setShowSidebar = useSettingStore((state) => state.setShowSidebar);
  const setView = useExplorerStore((state) => state.setView);
  const favoriteFiles = useFavoritesStore((state) => state.files);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const folderTag = currentFolder?.tag;
  const { setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    setOpen(showSidebar);
    setOpenMobile(showSidebar);
  }, [showSidebar]);

  useEffect(() => {
    if (isMobile) {
      setShowSidebar(openMobile);
    }
  }, [isMobile, openMobile]);

  const handleNewFolder = async () => {
    try {
      await window.app.commands.execute("file:new-folder", {
        dirName: "New Folder",
      });
    } catch (error) {
      console.error("Failed to create new folder", error);
    }
  };

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="w-full h-12">
        <TauriDragRegion className="w-full h-full flex items-center justify-between">
          <div className="flex items-center"></div>
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="Close Sidebar"
              onClick={() =>
                window.app?.commands.execute("view:toggle-sidebar")
              }
            >
              <PanelLeftCloseIcon size={16} />
            </Button>
          </div>
        </TauriDragRegion>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={folderTag === SEARCH_TAG}
                  onClick={() => {
                    const folder = workspace.createFileEntry({
                      isDirectory: true,
                      tag: SEARCH_TAG,
                    });
                    setCurrentFolder(folder);
                    setView("folder");
                  }}
                  render={<a href="#" />}
                >
                  <SearchIcon size={16} />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={folderTag === RECENTS_TAG}
                  onClick={() => {
                    const folder = window.app.getRecentsFolder();
                    setCurrentFolder(folder);
                    setView("folder");
                  }}
                  render={<a href="#" />}
                >
                  <ClockIcon size={16} />
                  <span>Recents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={folderTag === FAVORITES_TAG}
                  onClick={() => {
                    const folder = window.app.getFavoritesFolder();
                    setCurrentFolder(folder);
                    setView("folder");
                  }}
                  render={<a href="#" />}
                >
                  <HeartIcon size={16} />
                  <span>Favorites</span>
                </SidebarMenuButton>
                <SidebarMenuBadge className="text-sidebar-foreground/40">
                  {favoriteFiles.length}
                </SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={folderTag === TRASH_TAG}
                  onClick={() => {
                    const folder = window.app.getTrashFolder();
                    setCurrentFolder(folder);
                    setView("folder");
                  }}
                  render={<a href="#" />}
                >
                  <Trash2Icon size={16} />
                  <span>Trash</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40">
            Folders
          </SidebarGroupLabel>
          <SidebarGroupAction
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-transparent cursor-pointer"
            title="Add Folder"
            onClick={handleAddFolder}
          >
            <FolderPlusIcon size={16} />
            <span className="sr-only">Add Folder</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.name}>
                  <SidebarMenuButton
                    isActive={
                      view === "folder" &&
                      folder.fullPath === currentFolder?.fullPath
                    }
                    onClick={() => {
                      setCurrentFolder(folder);
                      setView("folder");
                    }}
                    render={<a href="#" />}
                  >
                    {folder.tag === DRAFTS_TAG ? (
                      <FolderCheckIcon size={16} />
                    ) : (
                      <FolderIcon size={16} />
                    )}
                    <span>{folder.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40">
            Folders
          </SidebarGroupLabel>
          <SidebarGroupAction
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-transparent cursor-pointer"
            title="New Folder"
            onClick={handleNewFolder}
          >
            <FolderPlusIcon size={16} />
            <span className="sr-only">New Folder</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <FolderTreeView />
          </SidebarGroupContent>
        </SidebarGroup>

        <div></div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between">
          <div>
            {/* <Button size="sm" variant="outline" onClick={handleTestGreet}>
              Test
            </Button> */}
          </div>
          <div>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => window.app.commands.execute("view:show-settings")}
            >
              <SettingsIcon size={16} />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
