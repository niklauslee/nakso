import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { confirm } from "@tauri-apps/plugin-dialog";

export async function checkForUpdates() {
  console.log("checking for updates...");
  const update = await check();

  if (update) {
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );

    let downloaded = 0;
    let contentLength = 0;
    // alternatively we could also call update.download() and update.install() separately
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength!;
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case "Finished":
          console.log("download finished");
          break;
      }
    });

    console.log("update installed");

    const result = await confirm(
      `A new version has been downloaded. Restart to apply the update?`,
      {
        title: update.version,
        okLabel: "Restart",
        cancelLabel: "Later",
      }
    );
    if (result) {
      await relaunch();
    }
  } else {
    console.log("no update available");
  }
}
