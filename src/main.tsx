import React from "react";
import ReactDOM from "react-dom/client";
import { platform as getPlatform } from "@tauri-apps/plugin-os";
import App from "./components/app";
import { AppContext } from "./app-context";
import { apiContext } from "./api";
import { checkForUpdates } from "./updater";

declare global {
  interface Window {
    app: AppContext;
    api: typeof apiContext;
  }
}

/**
 * Detect platform using Tauri API and map to Node.js style platform strings.
 */
async function detectPlatform() {
  const platform = await getPlatform();
  switch (platform) {
    case "macos":
      return "darwin";
    case "linux":
      return "linux";
    case "windows":
      return "win32";
    default:
      return "unknown";
  }
}

async function start() {
  const platform = await detectPlatform();
  window.app = new AppContext(platform);
  window.api = apiContext;
  await window.app.setup();
  checkForUpdates();
}

start().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
