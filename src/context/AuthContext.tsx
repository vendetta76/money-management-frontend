import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

interface UserMeta {
  role: "Regular" | "Premium" | "Admin" | "Staff" | "Tester";
  premiumStartDate?: string;
  premiumEndDate?: string;
  daysLeft?: number;
  preferredCurrency?: {
    code: string;
    locale: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userMeta: UserMeta | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Refs for tracking listeners that need cleanup
  const firestoreListenersRef = useRef<Array<() => void>>([]);
  const authListenerRef = useRef<() => void | null>(null);
  const isSigningOutRef = useRef(false);
  
  // Track whether component is mounted
  const isMountedRef = useRef(true);

  // Clean up function for all listeners
  const cleanupAllListeners = () => {
    console.log("🧹 Cleaning up all listeners");
    
    // Clear Firestore listeners
    firestoreListenersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (e) {
        console.error("Error unsubscribing from Firestore:", e);
      }
    });
    firestoreListenersRef.current = [];
    
    // Clear Auth listener
    if (authListenerRef.current) {
      try {
        authListenerRef.current();
        authListenerRef.current = null;
      } catch (e) {
        console.error("Error unsubscribing from Auth:", e);
      }
    }
  };

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Set up auth change listener
    authListenerRef.current = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMountedRef.current) return;
      
      // If we're in the process of signing out, don't process auth changes
      if (isSigningOutRef.current) {
        console.log("🚫 Ignoring auth change during signout");
        return;
      }
      
      if (currentUser) {
        try {
          await currentUser.reload();
          const tokenResult = await currentUser.getIdTokenResult(true);
          console.log("💠 Custom claims:", tokenResult.claims);
          const hasAdminClaim = tokenResult.claims?.Admin === true;

          if (isMountedRef.current) {
            setUser(currentUser);
            window.firebaseUser = currentUser;
          }

          const docRef = doc(db, "users", currentUser.uid);

          try {
            // First get initial data
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              processUserData(docSnap.data(), hasAdminClaim);
            } else {
              console.log("✅ [AuthContext] new user, creating document");
              const initialRole = hasAdminClaim ? "Admin" : "Regular";
              await setDoc(docRef, { role: initialRole }, { merge: true });
              if (isMountedRef.current) {
                setUserMeta({ role: initialRole });
              }
            }
            
            // Then set up real-time listener
            const unsubscribe = onSnapshot(
              docRef,
              (docSnap) => {
                if (docSnap.exists()) {
                  processUserData(docSnap.data(), hasAdminClaim);
                } else {
                  if (isMountedRef.current) {
                    setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
                  }
                }
              },
              (error) => {
                console.error("🔥 [AuthContext] Firestore listener error:", error);
                if (isMountedRef.current) {
                  setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
                  setLoading(false);
                }
              }
            );
            
            // Store the unsubscribe function
            firestoreListenersRef.current.push(unsubscribe);
          } catch (err) {
            console.error("Error loading userMeta:", err);
            if (isMountedRef.current) {
              setUserMeta({ role: "Regular" });
              setLoading(false);
            }
          }
        } catch (err) {
          console.error("Error refreshing user:", err);
          if (isMountedRef.current) {
            setUserMeta({ role: "Regular" });
            setLoading(false);
          }
        }
      } else {
        // Clean up listeners when user is null
        cleanupAllListeners();
        
        if (isMountedRef.current) {
          setUser(null);
          setUserMeta(null);
          setLoading(false);
        }
      }
    });

    // Process user data from Firestore
    const processUserData = (data: any, hasAdminClaim: boolean) => {
      if (!isMountedRef.current) return;
      
      let role: UserMeta["role"] = hasAdminClaim ? "Admin" : "Regular";

      const firestoreRole = data.role || "Regular";
      const allowedRoles = ["Regular", "Premium", "Admin", "Staff", "Tester"];

      if (hasAdminClaim) {
        role = "Admin";
        if (firestoreRole !== "Admin") {
          setDoc(docRef, { role: "Admin" }, { merge: true })
            .catch(err => console.error("Error updating admin role:", err));
        }
      } else {
        role = allowedRoles.includes(firestoreRole) ? firestoreRole : "Regular";
      }

      const premiumStartDate = data.premiumStartDate;
      const premiumEndDate = data.premiumEndDate;
      const preferredCurrency = data.preferredCurrency || null;

      let daysLeft = 0;
      if (premiumEndDate) {
        const today = new Date();
        const end = new Date(premiumEndDate);
        const diff = end.getTime() - today.getTime();
        daysLeft = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
      }

      console.log("✅ [AuthContext] user data processed:", { role, daysLeft });
      
      if (isMountedRef.current) {
        setUserMeta({ role, premiumStartDate, premiumEndDate, daysLeft, preferredCurrency });
        setLoading(false);
      }
    };

    // Cleanup function for component unmount
    return () => {
      isMountedRef.current = false;
      cleanupAllListeners();
    };
  }, []);

  const signOut = async () => {
    console.log("🚪 [AuthContext] Sign out initiated");
    
    // Prevent re-entrant signout
    if (isSigningOutRef.current) {
      console.log("🚫 Already signing out, ignoring duplicate request");
      return;
    }
    
    isSigningOutRef.current = true;
    
    try {
      // Store logout reason before clearing storage
      const reason = sessionStorage.getItem('logoutReason') || 'user';
      
      // Clear all storage except the logout reason
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("remember");
      localStorage.removeItem("lastActivityTime");
      localStorage.removeItem("logoutScheduledTime");
      
      // Re-set the logout reason in case it was cleared
      sessionStorage.setItem('logoutReason', reason);
      
      // Clean up all listeners
      cleanupAllListeners();
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sign out from Firebase auth
      await firebaseSignOut(auth);
      
      console.log("✅ [AuthContext] Sign out completed successfully");
    } catch (err) {
      console.error("❌ [AuthContext] Error during sign out:", err);
      
      // Try to clean up even if sign out fails
      try {
        cleanupAllListeners();
        await firebaseSignOut(auth);
      } catch (e) {
        console.error("Failed final cleanup attempt:", e);
      }
    } finally {
      isSigningOutRef.current = false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, userMeta }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};