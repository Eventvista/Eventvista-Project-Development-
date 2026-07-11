// frontend/app/lib/authClient.js
/**
 * @file frontend/app/lib/authClient.js
 * @description Authentication management client for Eventvista.
 * Coordinates real-time Firebase Identity Provider workflows with state persistence 
 * pipelines across the central MongoDB application data architecture.[cite: 17]
 */

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "@/config/firebase";

const googleProvider = new GoogleAuthProvider();

// System microservice base route configuration[cite: 17]
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// =========================================================================
// SECTION 1: COMPREHENSIVE LOCAL CACHE PERSISTENCE ENGINE[cite: 17]
// =========================================================================

/**
 * Caches the raw Firebase token safely inside local space bounds.[cite: 17]
 * @param {string} idToken - The decoded token string.[cite: 17]
 */
function persistIdToken(idToken) {
  localStorage.setItem("firebase_id_token", idToken);
}

/**
 * Commits the verification token and application payload profiles to memory.[cite: 17]
 * @param {string} appToken - The custom JWT assigned by the backend.[cite: 17]
 * @param {object} user - The structural User schema metadata document from MongoDB.[cite: 17]
 */
function persistAppSession(appToken, user) {
  localStorage.setItem("token", appToken);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userRole", user.role);
}

// =========================================================================
// SECTION 2: IDENTITY SIGN IN AND REGISTRATION PATHWAYS[cite: 17]
// =========================================================================

/**
 * Spawns the authentic Google Provider popup view, captures identity metrics,
 * and passes verification tokens downstream to determine signup state logic.[cite: 17]
 * 
 * @returns {Promise<{ isNewUser: boolean, idToken: string, email: string, firebaseUid?: string, appToken?: string, user?: object }>}
 */
export async function signInWithGoogle() {
  try {
    // Open the authentic modal overlay channel for user credentials[cite: 17]
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Verify token validity directly against the central server security framework[cite: 17]
    const res = await fetch("/api/v1/auth/session-verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    
    // Safeguard Layer: Validate status directly before executing standard JSON body reads
    if (!res.ok) {
      throw new Error(`Server returned a critical transaction fault: ${res.status}`);
    }
    
    const body = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Could not verify authentic session with the server.[cite: 17]");
    }

    // Always cache the raw identity string for deep AI Advisor/Onboarding guard protection[cite: 17]
    persistIdToken(idToken);

    // Dynamic routing condition split tracking based on user registration index[cite: 17]
    if (body.isNewUser) {
      return { 
        isNewUser: true, 
        idToken, 
        email: body.email, 
        firebaseUid: body.firebaseUid 
      };
    }

    // Fully hydrated profile found: persist session and pass metrics onward[cite: 17]
    persistAppSession(body.token, body.data);
    return { isNewUser: false, idToken, appToken: body.token, user: body.data };
  } catch (error) {
    console.error("Popup interface tracking exception:", error);
    throw error;
  }
}

/**
 * Explicitly structures an absolute User creation matrix object inside MongoDB 
 * post-onboarding layout form choices for brand new system signups.[cite: 17]
 * 
 * @param {object} params
 * @param {string} params.idToken - Fresh authorization validation string.[cite: 17]
 * @param {string} params.name - User profile identity descriptor.[cite: 17]
 * @param {string} params.role - Account privileges setting flag.[cite: 17]
 * @param {string} params.businessName - Corporate asset structure string placeholder.[cite: 17]
 * @returns {Promise<object>} The fully established MongoDB user record data map.[cite: 17]
 */
export async function completeProfile({ idToken, name, role, businessName }) {
  const res = await fetch("/api/v1/users/complete-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ name, role, businessName }),
  });
  
  // Safeguard Layer: Intercept 404, 500, or raw textual errors early
  if (!res.ok) {
    throw new Error(`Server profile initialization failed: ${res.status}`);
  }
  
  const body = await res.json();
  if (!body.success) {
    throw new Error(body.message || "Could not complete your profile registration details.[cite: 17]");
  }
  
  persistAppSession(body.token, body.data);
  return body.data;
}

// =========================================================================
// SECTION 3: SUBSCRIPTION LIFECYCLE LISTENERS AND SESSION DEPRECATION[cite: 17]
// =========================================================================

/**
 * Explicitly captures core Firebase signature rotations to keep authorization strings fresh.[cite: 17]
 * Essential for persistent client views making long asynchronous network requests.[cite: 17]
 * 
 * @param {Function} callback - Callback executable receiving the updated token.[cite: 17]
 * @returns {import("firebase/auth").Unsubscribe} Lifecycle termination cleanup engine.[cite: 17]
 */
export function watchIdToken(callback) {
  return onIdTokenChanged(auth, async (user) => {
    if (!user) return;
    const idToken = await user.getIdToken();
    persistIdToken(idToken);
    callback?.(idToken);
  });
}

/**
 * Invalidates system contexts, triggers explicit client sign out, and clears local variables.[cite: 17]
 */
export async function signOutUser() {
  await signOut(auth);
  localStorage.removeItem("token");
  localStorage.removeItem("firebase_id_token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
}

export { auth };