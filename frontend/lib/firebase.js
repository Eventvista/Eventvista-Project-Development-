// frontend/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdM0bTpnP75-hNHnvCSrCZ7XhlSZpUtLo",
  authDomain: "eventista-project.firebaseapp.com",
  databaseURL: "https://eventista-project-default-rtdb.firebaseio.com",
  projectId: "eventista-project",
  storageBucket: "eventista-project.firebasestorage.app",
  messagingSenderId: "482751663494",
  appId: "1:482751663494:web:b57fd1413753b599627007",
  measurementId: "G-DQQ86QH8K1",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();