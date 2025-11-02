import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { confirm } from "@tauri-apps/plugin-dialog";

export async function checkForUpdates() {
  const update = await check();
  if (update) {
    // download and install the update
    await update.downloadAndInstall();
    // ask user to restart the app to apply the update
    const result = await confirm(
      `A new version has been downloaded. Restart to apply the update?`,
      {
        title: update.version,
        okLabel: "Restart",
        cancelLabel: "Later",
      }
    );
    if (result) {
      if (window.app) await window.app.ensureSave();
      await relaunch();
    }
  }
}
