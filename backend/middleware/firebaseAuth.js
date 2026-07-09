import admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

/**
 * Intercepts Bearer authorization headers, verifies the identity token against
 * the Firebase Admin instance, and connects the user context to the database.
 */
export const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Access denied. Token payload missing.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    req.firebaseEmail = decodedToken.email;
    
    // Look up local user entry by Firebase UID mapping
    req.user = await User.findOne({ firebaseUid: decodedToken.uid });
    next();
  } catch (error) {
    throw new ApiError(401, `Identity verification failed: ${error.message}`);
  }
});