// backend/config/firebase.js
import admin from "firebase-admin";
import { createRequire } from "module";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);

let serviceAccount = null;

// =========================================================================
// STRATEGY 1: Method 2 - Stringified Environment Variable Evaluation
// =========================================================================
if (process.env.FIREBASE_CREDENTIALS) {
  try {
    // Attempt parsing the compressed single-line configuration string back to JSON[cite: 18]
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } catch (error) {
    console.warn("Method 2 Warning: Found FIREBASE_CREDENTIALS env var, but failed to parse JSON string. Falling back to file system parsing...", error.message);
  }
}

// =========================================================================
// STRATEGY 2: Method 1 & Local Fallbacks - File System Traversal
// =========================================================================
if (!serviceAccount) {
  // Define all possible credentials file locations across production platforms and local workstations
  const renderSecretPath = '/etc/secrets/firebase-service-account.json'; // Method 1: Render mount path[cite: 18]
  const renderRootPath = path.resolve(process.cwd(), 'firebase-service-account.json');   // Alternative production root folder
  const localConfigPath = path.resolve(process.cwd(), 'config', 'firebase-service-account.json'); // Local config directory fallback

  let absolutePathToSecret = localConfigPath; // Default fallback assignment

  // Determine the first existing absolute path matching operational host environment topology
  if (fs.existsSync(renderSecretPath)) {
    absolutePathToSecret = renderSecretPath;
  } else if (fs.existsSync(renderRootPath)) {
    absolutePathToSecret = renderRootPath;
  }

  try {
    // Cleanly require the service account JSON file using the dynamically resolved target path
    serviceAccount = require(absolutePathToSecret);
  } catch (error) {
    console.error(`Method 1 Critical Error: Failed to resolve or read credentials file at path: ${absolutePathToSecret}`);
  }
}

// =========================================================================
// SECTION 3: SDK INITIALIZATION MATRIX GUARD
// =========================================================================
if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Throw an explicit system fault if both environment vars and file layers fail to provide credentials
    throw new Error(
      "Critical Configuration Fault: Unable to resolve Firebase Admin service account credentials. " +
      "Verify your Render Secret Files path configuration or check your FIREBASE_CREDENTIALS environment variable string."
    );
  }
}

export default admin;