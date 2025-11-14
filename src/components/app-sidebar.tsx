import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
import {
  DRAFTS_TAG,
  FAVORITES_TAG,
  RECENTS_TAG,
  SEARCH_TAG,
  TRASH_TAG,
} from "@/const";
import { useFavoritesStore } from "@/store/favorites-store";
import { workspace } from "@/api/workspace";

export function AppSidebar() {
  const view = useExplorerStore((state) => state.view);
  const setView = useExplorerStore((state) => state.setView);
  const folders = useExplorerStore((state) => state.folders);
  const favoriteFiles = useFavoritesStore((state) => state.files);
  const currentFolder = useExplorerStore((state) => state.currentFolder);
  const setCurrentFolder = useExplorerStore((state) => state.setCurrentFolder);
  const folderTag = currentFolder?.tag;

  const handleNewFile = () => {
    window.app?.commands.execute("file:new");
  };

  const handleTestGreet = async () => {
    try {
      // const result = await invoke<string>("greet", { name: "Niklaus" });
      const result = await window.api.system.getSystemFonts();
      console.log(result);
    } catch (error) {
      console.error("Error calling greet:", error);
    }
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
              onMouseDownCapture={(e) => e.stopPropagation()}
              onClick={handleNewFile}
            >
              <PlusIcon size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="New Folder"
              onMouseDownCapture={(e) => e.stopPropagation()}
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
              onMouseDownCapture={(e) => e.stopPropagation()}
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
                    const folder = workspace.createFileEntry({
                      fullPath: window.app.getRecentsPath(),
                      isDirectory: true,
                      tag: RECENTS_TAG,
                    });
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
                    const folder = workspace.createFileEntry({
                      fullPath: window.app.getFavoritesPath(),
                      isDirectory: true,
                      tag: FAVORITES_TAG,
                    });
                    setCurrentFolder(folder);
                    setView("folder");
                  }}
                  render={<a href="#" />}
                >
                  <HeartIcon size={16} />
                  <span>Favorites</span>
                </SidebarMenuButton>
                <SidebarMenuBadge className="text-muted-foreground">
                  {favoriteFiles.length}
                </SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={folderTag === TRASH_TAG}
                  onClick={() => {
                    const folder = workspace.createFileEntry({
                      fullPath: window.app.getTrashDir(),
                      isDirectory: true,
                      tag: TRASH_TAG,
                    });
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
        </SidebarGroup>
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
