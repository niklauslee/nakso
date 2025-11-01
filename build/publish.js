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
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

// Read package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);

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

function generateNewLatestJson() {
  return {
    version: packageJson.version,
    pub_date: new Date().toISOString(),
    platforms: {},
  };
}

/**
 * Check if 'latest.json' exists
 */
async function checkLatestJson() {
  const OBJECT_KEY = "releases/latest.json";
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
    });
    await s3Client.send(headCommand);
    return true;
  } catch (headError) {
    if (headError.name === "NotFound") {
      console.log(`Object not found: s3://${BUCKET_NAME}/${OBJECT_KEY}`);
      return false;
    }
    throw headError;
  }
}

/**
 * Read and parse 'latest.json'
 */
async function readLatestJson() {
  const OBJECT_KEY = "releases/latest.json";
  try {
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
    try {
      const jsonData = JSON.parse(text);
      return jsonData;
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
      return text;
    }
  } catch (error) {
    console.error("Failed to read latest.json:", error.message);
    throw error;
  }
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
  const exists = await checkLatestJson();
  if (!exists) {
    const newLatestJson = generateNewLatestJson();
    await uploadLatestJson(newLatestJson);
  }
}

async function main() {
  console.log("Package version:", packageJson.version);
  console.log("arch:", os.arch());
  console.log("platform:", os.platform());
  console.log("latest.json", generateNewLatestJson());

  try {
    await ensureLatestJson();
  } catch (error) {
    console.error("\n=== Error during S3 objects access ===");
  }
}

await main();
