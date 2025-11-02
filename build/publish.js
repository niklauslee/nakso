/**
 * Publish build artifacts to remote S3 storage.
 *
 * Required environment variables:
 * -------------------------------
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_S3_ENDPOINT
 * - AWS_S3_BUCKET_NAME
 * - AWS_REGION
 *
 * Publishing steps:
 * -----------------
 * 1. ensure latest.json
 *   1.1. check latest.json
 *   1.2. if not exists, upload new latest.json (blank platforms field)
 * 2. compare version
 *   2.1. read versions from latest.json and package.json
 *   2.2. if package.json version > latest.json version
 *     2.2.1. upload new latest.json (with blank platforms field)
 * 3. upload build artifacts
 *   3.1. check if build artifacts exist
 *   3.2. if exists, upload each artifact to S3
 *   3.3. update latest.json with platform fields (url and signature)
 */

import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import semver from "semver";

// Read package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);
const productName = packageJson.productName;
const currentVersion = packageJson.version;

// AWS S3 configuration from environment variables
const s3Config = {
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
const s3Client = new S3Client(s3Config);
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_URL = process.env.AWS_S3_BUCKET_URL;

const INSTALLER_FILES = {
  "aarch64-apple-darwin": `../src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/${productName}_${currentVersion}_aarch64.dmg`,
  "x86_64-apple-darwin": `../src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/${productName}_${currentVersion}_x64.dmg`,
};

const BUNDLE_FILES = {
  "aarch64-apple-darwin": `../src-tauri/target/aarch64-apple-darwin/release/bundle/macos/${productName}.app.tar.gz`,
  "x86_64-apple-darwin": `../src-tauri/target/x86_64-apple-darwin/release/bundle/macos/${productName}.app.tar.gz`,
};

const SIGNATURE_FILES = {
  "aarch64-apple-darwin": `../src-tauri/target/aarch64-apple-darwin/release/bundle/macos/${productName}.app.tar.gz.sig`,
  "x86_64-apple-darwin": `../src-tauri/target/x86_64-apple-darwin/release/bundle/macos/${productName}.app.tar.gz.sig`,
};

function getPlatform() {
  const platform = os.platform();
  if (platform === "win32") return "windows";
  return platform;
}

function getRustPlatform() {
  const platform = os.platform();
  if (platform === "win32") return "pc-windows-msvc";
  if (platform === "darwin") return "apple-darwin";
  if (platform === "linux") return "unknown-linux-gnu";
  return platform;
}

function getArch() {
  // Check if --arch argument is provided
  // Supports both --arch aarch64 and --arch=aarch64
  const archArg = process.argv.find((arg) => arg.startsWith("--arch"));
  if (archArg) {
    if (archArg.includes("=")) {
      return archArg.split("=")[1];
    }
    const archArgIndex = process.argv.indexOf(archArg);
    if (process.argv[archArgIndex + 1]) {
      return process.argv[archArgIndex + 1];
    }
  }

  const arch = os.arch();
  if (arch === "arm64") return "aarch64";
  if (arch === "x64") return "x86_64";
  return arch;
}

function getTarget() {
  return `${getPlatform()}-${getArch()}`;
}

function getRustTarget() {
  return `${getArch()}-${getRustPlatform()}`;
}

/**
 * Generate a new latest.json structure
 */
function generateNewLatestJson() {
  return {
    version: currentVersion,
    pub_date: new Date().toISOString(),
    platforms: {},
  };
}

/**
 * Read and parse 'latest.json'
 */
async function readLatestJson() {
  const OBJECT_KEY = "releases/latest.json";
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: OBJECT_KEY,
  });
  const response = await s3Client.send(getCommand);
  // Convert stream to string
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf-8");
  const jsonData = JSON.parse(text);
  return jsonData;
}

/**
 * Upload 'latest.json' to S3
 */
async function uploadLatestJson(jsonData) {
  const OBJECT_KEY = "releases/latest.json";
  try {
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
      Body: JSON.stringify(jsonData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
  } catch (error) {
    console.error("Failed to upload latest.json:", error.message);
    throw error;
  }
}

/**
 * Ensure 'latest.json' exists; if not, create and upload a new one
 */
async function ensureLatestJson() {
  let latestJson;
  try {
    latestJson = await readLatestJson();
  } catch (error) {
    if (!latestJson) {
      const newLatestJson = generateNewLatestJson();
      await uploadLatestJson(newLatestJson);
      console.log("[publish] a new latest.json has been created and uploaded.");
      latestJson = newLatestJson;
    }
  }
  return latestJson;
}

/**
 * Check if build artifacts exist for the given rust target
 */
function checkBundleArtifacts(rustTarget) {
  const installerPath = path.join(__dirname, INSTALLER_FILES[rustTarget]);
  const bundlePath = path.join(__dirname, BUNDLE_FILES[rustTarget]);
  const signaturePath = path.join(__dirname, SIGNATURE_FILES[rustTarget]);

  if (!fs.existsSync(installerPath)) {
    console.error(`[publish] error: installer not found at ${installerPath}`);
    return false;
  }
  if (!fs.existsSync(bundlePath)) {
    console.error(`[publish] error: bundle not found at ${bundlePath}`);
    return false;
  }
  if (!fs.existsSync(signaturePath)) {
    console.error(`[publish] error: signature not found at ${signaturePath}`);
    return false;
  }

  return true;
}

/**
 * Upload bundle artifacts to S3
 */
async function uploadBundleArtifacts(rustTarget, platform, arch, version) {
  const installerPath = path.join(__dirname, INSTALLER_FILES[rustTarget]);
  const bundlePath = path.join(__dirname, BUNDLE_FILES[rustTarget]);
  const signaturePath = path.join(__dirname, SIGNATURE_FILES[rustTarget]);

  const uploadPath = `releases/${platform}/${arch}/${version}`;

  try {
    // Upload installer (DMG)
    const installerKey = `${uploadPath}/${path.basename(installerPath)}`;
    const installerBody = fs.readFileSync(installerPath);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: installerKey,
        Body: installerBody,
        ContentType: "application/octet-stream",
      })
    );
    console.log(`[publish] uploaded installer: ${installerKey}`);

    // Upload bundle (tar.gz)
    const bundleKey = `${uploadPath}/${path.basename(bundlePath)}`;
    const bundleBody = fs.readFileSync(bundlePath);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: bundleKey,
        Body: bundleBody,
        ContentType: "application/gzip",
      })
    );
    console.log(`[publish] uploaded bundle: ${bundleKey}`);

    // Read signature (not uploaded to S3)
    const signatureBody = fs.readFileSync(signaturePath, "utf-8");

    // Construct the download URL for the bundle
    const bundleUrl = `${BUCKET_URL}/${bundleKey}`;

    return {
      url: bundleUrl,
      signature: signatureBody,
    };
  } catch (error) {
    console.error("[publish] error uploading bundle artifacts:", error.message);
    throw error;
  }
}

async function main() {
  const platform = getPlatform();
  const arch = getArch();
  const target = getTarget();
  const rustTarget = getRustTarget();
  console.log(
    `[publish] publishing ${target} (${rustTarget}) ${currentVersion}`
  );

  let latestJson;
  try {
    // ensure latest.json exists
    latestJson = await ensureLatestJson();

    // if try to publish older version, warn and exit
    if (semver.lt(currentVersion, latestJson.version)) {
      console.warn(
        `[publish] warning: package.json version (${currentVersion}) is older than latest.json version (${latestJson.version})`
      );
      console.warn(
        "[publish] please ensure you are publishing the correct version."
      );
      return;
    }

    // if try to publish newer version, create new latest.json
    if (semver.gt(currentVersion, latestJson.version)) {
      console.log(`[publish] newer version detected: ${currentVersion}`);
      const newLatestJson = generateNewLatestJson();
      await uploadLatestJson(newLatestJson);
      latestJson = newLatestJson;
      console.log("[publish] latest.json has been updated.");
    }

    // if versions are equal, publish the platform-specific bundle
    if (semver.eq(currentVersion, latestJson.version)) {
      // check if platform is already published
      if (latestJson.platforms[target]) {
        console.warn(
          `[publish] warning: platform ${target} is already published in latest.json.`
        );
        console.warn("[publish] skipping upload for this platform.");
        return;
      }

      // check if bundle artifacts exist
      if (!checkBundleArtifacts(rustTarget)) {
        return;
      }

      // upload bundle artifacts
      const platformData = await uploadBundleArtifacts(
        rustTarget,
        platform,
        arch,
        currentVersion
      );
      console.log("platformData:", platformData);

      // update latest.json with platform information
      latestJson.platforms[target] = platformData;
      await uploadLatestJson(latestJson);
      console.log("[publish] latest.json has been updated with new platform.");

      console.log(`[publish] platform ${target} successfully published.`);
    }
  } catch (error) {
    console.error("\n=== Error during S3 objects access ===", error);
  }
}

await main();
