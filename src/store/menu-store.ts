import { create } from "zustand";
import { produce } from "immer";
import type { KeyMap } from "../engine/keymap-manager";
import { trimObject } from "@/lib/utils";

export interface MenuItemState {
  enabled?: boolean;
  checked?: boolean;
}

export interface MenuItem extends MenuItemState {
  id?: string;
  type?: string;
  label?: string;
  submenu?: MenuItem[];
  subtext?: string;
  command?: string;
  inset?: boolean;
  icon?: boolean;
  external?: boolean;
  "command-args"?: any[];
}

export type Menu = MenuItem[];

export interface MenuState {
  menus: Record<string, Menu>;
  setMenus: (menus: Record<string, Menu>, keymap?: KeyMap) => void;
  updateStates: (id: string, itemStates: MenuItemState) => void;
  setOpenRecent: (recent: string[]) => void;
}

function traverseCopy(menu: Menu, fun: (item: MenuItem) => void): Menu {
  return menu.map((item) => {
    const i: MenuItem = { ...item };
    fun(i);
    if (Array.isArray(i.submenu)) {
      i.submenu = traverseCopy(i.submenu, fun);
    }
    return i;
  });
}

function find(menu: Menu, id: string): MenuItem | null {
  for (const item of menu) {
    if (item.id === id) return item;
    if (Array.isArray(item.submenu)) {
      const r = find(item.submenu, id);
      if (r) return r;
    }
  }
  return null;
}

export function mergeKeymap(menu: Menu, keymap: KeyMap): Menu {
  return traverseCopy(menu, (item) => {
    item.enabled = true;
    item.checked = false;
    if (keymap && item.command && keymap[item.command]) {
      item.subtext = keymap[item.command];
    }
  });
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  menus: {},
  setMenus: (menus, keymap) => {
    const initializedMenus = Object.fromEntries(
      Object.entries(menus).map(([key, menu]) => [
        key,
        keymap ? mergeKeymap(menu, keymap) : menu,
      ])
    );
    set({ menus: initializedMenus });
  },
  updateStates: (id: string, itemStates: MenuItemState) =>
    set(
      produce<MenuState>((state) => {
        const updatedMenus = Object.fromEntries(
          Object.entries(state.menus).map(([key, menu]) => [
            key,
            traverseCopy(menu, (item) => {
              if (item.id === id) Object.assign(item, itemStates);
            }),
          ])
        );
        state.menus = updatedMenus;
      })
    ),
  setOpenRecent: (recent: string[]) =>
    set(
      produce<MenuState>((state) => {
        const updatedMenus = Object.fromEntries(
          Object.entries(state.menus).map(([key, menu]) => [
            key,
            traverseCopy(menu, (item) => {
              if (item.id === "file.open-recent") {
                const submenu =
                  recent.length === 0
                    ? [
                        {
                          label: "No recent files",
                          enabled: false,
                          checked: false,
                        },
                      ]
                    : recent.map((r, i) => ({
                        label: r,
                        id: `file.open-recent-${i}`,
                        enabled: true,
                        checked: false,
                        command: "file:open-recent",
                        "command-args": { filePath: r },
                      }));
                Object.assign(
                  item,
                  trimObject({
                    submenu: submenu,
                  })
                );
              }
            }),
          ])
        );
        state.menus = updatedMenus;
      })
    ),
}));
