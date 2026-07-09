// backend/config/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./path-to-your-firebase-adminsdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;