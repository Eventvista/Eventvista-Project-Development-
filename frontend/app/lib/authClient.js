// frontend/app/lib/authClient.js
/**
 * @file frontend/app/lib/authClient.js
 * @description Authentication management client for Eventvista.
 * Coordinates real-time Firebase Identity Provider workflows with state persistence 
 * pipelines across the central MongoDB application data architecture.[cite: 17]
 */

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "@/config/firebase";

// Configure standard scopes for the authentic Google auth provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

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
<<<<<<< HEAD
 * Spawns the authentic Google Provider popup view, captures identity metrics,
 * and passes verification tokens downstream to determine signup state logic.[cite: 17]
=======
 * Validates a Firebase ID token against the centralized Eventvista authentication endpoint.
 * Handles parsing fallbacks gracefully in the event of upstream network failures.
>>>>>>> feature/central-hub-routing
 * 
 * @param {string} idToken - The raw decoded Firebase Identity Token.
 * @returns {Promise<{ isNewUser: boolean, idToken: string, email: string, firebaseUid?: string, appToken?: string, user?: object }>}
 */
async function verifySessionWithBackend(idToken) {
  const res = await fetch(`${API_BASE}/auth/session-verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  // Handle non-JSON server responses gracefully (e.g. HTML 502/504 Gateway errors)
  let body;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    body = await res.json();
  } else {
    const errorText = await res.text();
    throw new Error(errorText || `Network handshake returned HTTP status code: ${res.status}`);
  }

  if (!res.ok || !body.success) {
    throw new Error(body.message || "Could not verify authentic session with the server.");
  }

  // Always cache the raw identity string for deep AI Advisor/Onboarding guard protection
  persistIdToken(idToken);

  // Dynamic routing split tracking based on user registration index
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
}

/**
 * Spawns the Google Provider login popup instantly to bypass browser blockers.
 * Automatically falls back to a page redirect on high-security browsers and iOS devices.
 * 
 * @returns {Promise<{ isNewUser: boolean, idToken: string, email: string, firebaseUid?: string, appToken?: string, user?: object }|undefined>}
 */
export async function signInWithGoogle() {
  let userCredential;

  try {
<<<<<<< HEAD
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
=======
    // 1. CRITICAL: Invoke popup synchronously at the top of the stack.
    // This satisfies strict browser security rules to prevent "auth/popup-blocked" errors.
    userCredential = await signInWithPopup(auth, googleProvider);
>>>>>>> feature/central-hub-routing
  } catch (error) {
    // 2. Catch popup blockages/user closures and fall back to redirect protocol
    if (
      error.code === "auth/popup-blocked" || 
      error.code === "auth/popup-closed-by-user" ||
      (typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)) // Auto-redirect on iOS devices
    ) {
      console.warn("Popup blocked or unsafe context detected. Transitioning to redirect flow...");
      await signInWithRedirect(auth, googleProvider);
      return; // Execution halts as the browser page reloads and redirects
    }
    throw new Error(`Firebase Auth Error: ${error.message}`);
  }

  // 3. Begin server-side session exchange with secure token extraction
  try {
    const idToken = await userCredential.user.getIdToken();
    return await verifySessionWithBackend(idToken);
  } catch (error) {
    console.error("Identity verification pipeline failed:", error);
    throw new Error(`Identity verification failed: ${error.message}`);
  }
}

/**
 * Hook this function up to your login page/layout mounting cycle (useEffect)
 * to intercept, capture, and verify returning redirect sessions.
 * 
 * @returns {Promise<object|null>} The completed user session record, or null if no redirect cycle is active.
 */
export async function handleRedirectCallback() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null; // No active redirect sequence in progress

    const idToken = await result.user.getIdToken();
    return await verifySessionWithBackend(idToken);
  } catch (error) {
    console.error("Redirect re-entry verification handshake failed:", error);
    return null;
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