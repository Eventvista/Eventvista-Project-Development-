// backend/config/firebase.js
import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Update this to point exactly to your actual private key file name
const serviceAccount = require("./firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;