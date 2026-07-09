// frontend/context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/config/firebase"; // Your frontend Firebase initialization file

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(firebaseApp);

  // YOUR SNIPPET INTEGRATED HERE
  const syncUserPermissions = async (currentUser) => {
    if (!currentUser) {
      setRole(null);
      return;
    }
    try {
      // Passing 'true' forces the client to download a fresh token with updated claims
      const tokenResult = await currentUser.getIdTokenResult(true);
      
      if (tokenResult.claims.role) {
        setRole(tokenResult.claims.role);
        console.log(`Access status: ${tokenResult.claims.role} verified.`);
      } else {
        setRole("client"); // Default fallback if no claim exists yet
        console.log("Access status: Standard Viewer (Client).");
      }
    } catch (error) {
      console.error("Error syncing user permissions:", error);
      setRole(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Run your token sync logic whenever the user state initializes
        await syncUserPermissions(currentUser);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, role, loading, syncUserPermissions }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);