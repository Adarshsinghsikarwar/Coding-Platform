import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, "../frontend");
const backendDistDir = path.resolve(__dirname, "./dist");
const frontendDistDir = path.resolve(frontendDir, "./dist");

console.log("=== RUNNING FRONTEND & BACKEND INTEGRATION BUILD ===");

try {
  // 1. Install frontend dependencies
  console.log("\n1. Installing frontend dependencies...");
  execSync("npx -y pnpm install", { cwd: frontendDir, stdio: "inherit" });

  // 2. Build the frontend
  console.log("\n2. Building frontend assets...");
  execSync("npx -y pnpm run build", { cwd: frontendDir, stdio: "inherit" });

  // 3. Clean up backend/dist if it exists
  console.log("\n3. Preparing backend/dist directory...");
  if (fs.existsSync(backendDistDir)) {
    fs.rmSync(backendDistDir, { recursive: true, force: true });
  }
  fs.mkdirSync(backendDistDir, { recursive: true });

  // 4. Copy frontend/dist to backend/dist
  console.log("\n4. Copying built assets to backend/dist...");
  fs.cpSync(frontendDistDir, backendDistDir, { recursive: true });

  console.log("\n[SUCCESS] Integration build completed successfully!");
} catch (error) {
  console.error("\n[FAIL] Build failed with error:", error.message);
  process.exit(1);
}
