import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const versionJsonPath = path.join(rootDir, "version.json");
const packageJsonPath = path.join(rootDir, "package.json");
const buildGradlePath = path.join(rootDir, "android", "app", "build.gradle");

// 1. Read or initialize version.json
let versionData = {
  major: 1,
  minor: 0,
  patch: 0,
  buildNumber: 1,
  versionName: "1.0.1",
};

if (fs.existsSync(versionJsonPath)) {
  try {
    versionData = JSON.parse(fs.readFileSync(versionJsonPath, "utf-8"));
  } catch (e) {
    console.warn("Could not parse version.json, resetting to default.");
  }
}

// Auto-increment build number and patch
versionData.buildNumber = (versionData.buildNumber || 0) + 1;
versionData.patch = (versionData.patch || 0) + 1;
versionData.versionName = `${versionData.major}.${versionData.minor}.${versionData.patch}`;
versionData.lastBuildTime = new Date().toISOString();

// Write back to version.json
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + "\n");

// 2. Update package.json version
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  pkg.version = versionData.versionName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
}

// 3. Update android/app/build.gradle
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, "utf-8");

  // Replace versionCode
  gradleContent = gradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionData.buildNumber}`
  );

  // Replace versionName
  gradleContent = gradleContent.replace(
    /versionName\s+["'][^"']+["']/,
    `versionName "${versionData.versionName}"`
  );

  fs.writeFileSync(buildGradlePath, gradleContent);
}

console.log(
  `🚀 [Auto-Version] Versi aplikasi otomatis diperbarui ke v${versionData.versionName} (versionCode: ${versionData.buildNumber})`
);

