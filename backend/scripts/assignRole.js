// backend/scripts/assignRole.js
const admin = require("../config/firebase");

const assignUserRole = async (uid, role) => {
  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { role: role });
    console.log(`Successfully assigned role [${role}] to user: ${uid}`);
    process.exit(0);
  } catch (error) {
    console.error("Error assigning role:", error);
    process.exit(1);
  }
};

// Example usage: Run via terminal
// node backend/scripts/assignRole.js "USER_UID_HERE" "admin"
const args = process.argv.slice(2);
assignUserRole(args[0], args[1]);