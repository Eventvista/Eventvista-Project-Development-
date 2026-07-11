// frontend/app/services/authService.js
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/config/firebase";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Return the credential/user info to pass to your MongoDB SSOT sync
    return result.user; 
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("Sign-in aborted: User closed the popup.");
      return null; 
    } else {
      console.error("Authentication fault:", error.message);
      throw error; // Re-throw critical errors you want the UI to display
    }
  }
};