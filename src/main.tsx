import React from "react";
import ReactDOM from "react-dom/client";
import { platform as getPlatform } from "@tauri-apps/plugin-os";
import App from "./components/app";
import { AppContext } from "./app-context";
import { apiContext } from "./api";

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

const platform = await detectPlatform();
window.app = new AppContext(platform);
window.api = apiContext;
window.app.setup();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
