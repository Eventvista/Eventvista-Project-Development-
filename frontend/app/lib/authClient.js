// frontend/app/lib/authClient.js
/**
 * @file frontend/app/lib/authClient.js
 * @description Authentication management client for Eventvista.
 * Coordinates real-time Firebase Identity Provider workflows with state persistence 
 * pipelines across the central MongoDB application data architecture.
 */

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "@/config/firebase";

const googleProvider = new GoogleAuthProvider();

// System microservice base route configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// =========================================================================
// SECTION 1: COMPREHENSIVE LOCAL CACHE PERSISTENCE ENGINE
// =========================================================================

/**
 * Caches the raw Firebase token safely inside local space bounds.
 * @param {string} idToken - The decoded token string.
 */
function persistIdToken(idToken) {
  localStorage.setItem("firebase_id_token", idToken);
}

/**
 * Commits the verification token and application payload profiles to memory.
 * @param {string} appToken - The custom JWT assigned by the backend.
 * @param {object} user - The structural User schema metadata document from MongoDB.
 */
function persistAppSession(appToken, user) {
  localStorage.setItem("token", appToken);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userRole", user.role);
}

// =========================================================================
// SECTION 2: IDENTITY SIGN IN AND REGISTRATION PATHWAYS
// =========================================================================

/**
 * Spawns the authentic Google Provider popup view, captures identity metrics,
 * and passes verification tokens downstream to determine signup state logic.
 * 
 * @returns {Promise<{ isNewUser: boolean, idToken: string, email: string, firebaseUid?: string, appToken?: string, user?: object }>}
 */
export async function signInWithGoogle() {
  try {
    // Open the authentic modal overlay channel for user credentials
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Verify token validity directly against the central server security framework
    const res = await fetch("/api/v1/auth/session-verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || "Could not verify authentic session with the server.");
    }

    // Always cache the raw identity string for deep AI Advisor/Onboarding guard protection
    persistIdToken(idToken);

    // Dynamic routing condition split tracking based on user registration index
    if (body.isNewUser) {
      return { 
        isNewUser: true, 
        idToken, 
        email: body.email, 
        firebaseUid: body.firebaseUid 
      };
    }

    // Fully hydrated profile found: persist session and pass metrics onward
    persistAppSession(body.token, body.data);
    return { isNewUser: false, idToken, appToken: body.token, user: body.data };
  } catch (error) {
    console.error("Popup interface tracking exception:", error);
    throw error;
  }
}

/**
 * Explicitly structures an absolute User creation matrix object inside MongoDB 
 * post-onboarding layout form choices for brand new system signups.
 * 
 * @param {object} params
 * @param {string} params.idToken - Fresh authorization validation string.
 * @param {string} params.name - User profile identity descriptor.
 * @param {string} params.role - Account privileges setting flag.
 * @param {string} params.businessName - Corporate asset structure string placeholder.
 * @returns {Promise<object>} The fully established MongoDB user record data map.
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
  
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || "Could not complete your profile registration details.");
  }
  
  persistAppSession(body.token, body.data);
  return body.data;
}

// =========================================================================
// SECTION 3: SUBSCRIPTION LIFECYCLE LISTENERS AND SESSION DEPRECATION
// =========================================================================

/**
 * Explicitly captures core Firebase signature rotations to keep authorization strings fresh.
 * Essential for persistent client views making long asynchronous network requests.
 * 
 * @param {Function} callback - Callback executable receiving the updated token.
 * @returns {import("firebase/auth").Unsubscribe} Lifecycle termination cleanup engine.
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
 * Invalidates system contexts, triggers explicit client sign out, and clears local variables.
 */
export async function signOutUser() {
  await signOut(auth);
  localStorage.removeItem("token");
  localStorage.removeItem("firebase_id_token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
}

export { auth };