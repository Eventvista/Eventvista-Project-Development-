// frontend/app/lib/authClient.js

import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const response = await signInWithPopup(auth, googleProvider);
    const idToken = await response.user.getIdToken();
    return { idToken, user: response.user };
  } catch (error) {
    console.error("Popup interface tracking exception:", error);
    throw error;
  }
}

export async function signOutUser() {
  await signOut(auth);
  localStorage.clear();
}

export { onAuthStateChanged, auth };