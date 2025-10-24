import { invoke } from "@tauri-apps/api/core";

/**
 * Get all system font family names installed on the user's machine.
 * Returns an array of font family names, sorted alphabetically.
 */
async function getSystemFonts(): Promise<string[]> {
  try {
    const fonts = await invoke<string[]>("get_system_fonts");
    return fonts;
  } catch (error) {
    console.error("Failed to get system fonts:", error);
    return [];
  }
}

export const system = {
  getSystemFonts,
};
