// frontend/config/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace these placeholders with your actual Firebase Web App credentials 
// from your Firebase Console (Project Settings > General > Your Apps)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Prevent Firebase from re-initializing during Next.js Hot Reloading (HMR)
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(firebaseApp);
export default firebaseApp;
