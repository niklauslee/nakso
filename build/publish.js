#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const COMMANDS = {
  darwin: [
    "npm run tauri build -- --target=aarch64-apple-darwin",
    "node build/upload -- --arch=aarch64",
    // "npm run tauri build -- --target=x86_64-apple-darwin",
    // "node build/upload -- --arch=x86_64",
  ],
  win32: [
    "npm run tauri build -- --target=x86_64-pc-windows-msvc",
    "node build/upload -- --arch=x86_64",
  ],
  linux: [
    "npm run tauri build -- --target=x86_64-unknown-linux-gnu",
    "node build/upload -- --arch=x86_64",
  ],
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change to project root directory
const rootDir = path.join(__dirname, "..");
process.chdir(rootDir);

// Load environment variables from .env file
dotenv.config({ path: path.join(rootDir, ".env") });

function runCommands(cmds) {
  for (const cmd of cmds) {
    console.log(`Executing: ${cmd}`);
    const options = {
      stdio: "inherit",
      env: process.env,
    };
    execSync(cmd, options);
    console.log("✓ Command completed\n");
  }
}

function publish() {
  const platform = os.platform();
  if (platform === "darwin") {
    runCommands(COMMANDS.darwin);
  } else if (platform === "win32") {
    runCommands(COMMANDS.win32);
  } else if (platform === "linux") {
    runCommands(COMMANDS.linux);
  } else {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }
}

publish();
