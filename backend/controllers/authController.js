// backend/controllers/authController.js
import * as admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js"; 
import Vendor from "../models/Vendor.js"; 

/**
 * @desc    Automated Registration for Clients and Vendors
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, displayName, role, businessName } = req.body;

  // 1. Validation
  if (!email || !password || !displayName || !role) {
    throw new ApiError(400, "All primary fields (email, password, name, role) are required.");
  }

  const allowedRoles = ["vendor", "client"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid application role requested.");
  }

  if (role === "vendor" && !businessName) {
    throw new ApiError(400, "Vendors must provide a valid business name.");
  }

  let firebaseUser;

  try {
    // 2. Create the User in Firebase Auth
    firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // 3. Immediately inject the Custom Claim (Role) inside Firebase token
    await admin.auth().setCustomUserClaims(firebaseUser.uid, { role });

    // 4. Save to your local Database
    // Pass the Firebase uid as the local database primary key (_id) to keep them linked
    const newLocalUser = await User.create({
      _id: firebaseUser.uid, 
      email,
      name: displayName,
      role,
    });

    // If the registering user is a vendor, auto-provision their vendor profile
    if (role === "vendor") {
      await Vendor.create({
        user: firebaseUser.uid,
        businessName,
      });
    }

    // 5. Success response
    res.status(201).json({
      success: true,
      message: `Successfully registered new ${role}!`,
      data: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
      },
    });

  } catch (error) {
    // Rollback mechanism: Clean up Firebase if database save fails
    if (firebaseUser && firebaseUser.uid) {
      await admin.auth().deleteUser(firebaseUser.uid);
    }
    
    throw new ApiError(400, error.message || "Registration workflow failed.");
  }
});