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
  
  // State to track sign-out sequence
  const isSigningOutRef = useRef(false);
  const lastSignOutTimeRef = useRef(0);
  const authStateChangedTimeRef = useRef(0);
  const firestoreListenersRef = useRef<Array<() => void>>([]);
  const authListenerRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const authDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up function for all listeners
  const cleanupAllListeners = () => {
    // Clear Firestore listeners
    firestoreListenersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (e) {
        // Handle error silently
      }
    });
    firestoreListenersRef.current = [];
    
    // Clear auth state change debounce timer
    if (authDebounceTimerRef.current) {
      clearTimeout(authDebounceTimerRef.current);
      authDebounceTimerRef.current = null;
    }
  };

  // Process user data from Firestore with better error handling
  const processUserData = async (userId: string, hasAdminClaim: boolean) => {
    if (!isMountedRef.current) return;
    
    try {
      const userDocRef = doc(db, "users", userId);
      
      // Get initial data
      const docSnap = await getDoc(userDocRef);
      let userData: any = null;
      
      // Process user document
      if (docSnap.exists()) {
        userData = docSnap.data();
        
        // Set up real-time listener with a reference so we can clean it up
        const unsubscribe = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (!isMountedRef.current) return;
            
            if (docSnap.exists()) {
              setUserMetaFromData(docSnap.data(), hasAdminClaim);
            } else {
              setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
            }
          },
          (error) => {
            if (isMountedRef.current) {
              setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
              setLoading(false);
            }
          }
        );
        
        // Store the unsubscribe function
        firestoreListenersRef.current.push(unsubscribe);
        
        // Process data initially
        setUserMetaFromData(userData, hasAdminClaim);
      } else {
        // Create user document if it doesn't exist
        const initialRole = hasAdminClaim ? "Admin" : "Regular";
        try {
          await setDoc(userDocRef, { role: initialRole }, { merge: true });
          if (isMountedRef.current) {
            setUserMeta({ role: initialRole });
            setLoading(false);
          }
        } catch (err) {
          if (isMountedRef.current) {
            setUserMeta({ role: initialRole });
            setLoading(false);
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
        setLoading(false);
      }
    }
  };
  
  // Helper function to set user meta from Firestore data
  const setUserMetaFromData = (data: any, hasAdminClaim: boolean) => {
    if (!isMountedRef.current) return;
    
    try {
      let role: UserMeta["role"] = hasAdminClaim ? "Admin" : "Regular";

      const firestoreRole = data.role || "Regular";
      const allowedRoles = ["Regular", "Premium", "Admin", "Staff", "Tester"];

      if (hasAdminClaim) {
        role = "Admin";
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
      
      setUserMeta({ role, premiumStartDate, premiumEndDate, daysLeft, preferredCurrency });
      setLoading(false);
    } catch (err) {
      setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
      setLoading(false);
    }
  };

  // Set up auth state change listener with debounce
  useEffect(() => {
    isMountedRef.current = true;
    
    // Clear any residual state
    if (authListenerRef.current) {
      authListenerRef.current();
      authListenerRef.current = null;
    }
    
    // Set up auth change listener with debounce
    const handleAuthStateChanged = async (currentUser: User | null) => {
      if (!isMountedRef.current) return;
      
      // Get the current time for debouncing
      const now = Date.now();
      authStateChangedTimeRef.current = now;
      
      // If we're signing out, don't process auth changes
      if (isSigningOutRef.current) {
        return;
      }
      
      // Check if we processed a sign out recently to prevent bounce-back
      if (lastSignOutTimeRef.current > 0 && now - lastSignOutTimeRef.current < 2000) {
        return;
      }
      
      // Clear previous debounce timer
      if (authDebounceTimerRef.current) {
        clearTimeout(authDebounceTimerRef.current);
      }
      
      // Debounce auth state changes
      authDebounceTimerRef.current = setTimeout(async () => {
        // Make sure this is still the most recent auth state change
        if (authStateChangedTimeRef.current !== now) return;
        
        if (currentUser) {
          try {
            // Set loading state while we process
            if (isMountedRef.current) {
              setLoading(true);
            }
            
            await currentUser.reload();
            const tokenResult = await currentUser.getIdTokenResult(true);
            const hasAdminClaim = tokenResult.claims?.Admin === true;

            if (isMountedRef.current) {
              setUser(currentUser);
              window.firebaseUser = currentUser;
            }

            // Process user data with new function
            await processUserData(currentUser.uid, hasAdminClaim);
          } catch (err) {
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
      }, 300); // Small debounce to prevent rapid changes
    };
    
    // Set up the auth state listener
    authListenerRef.current = onAuthStateChanged(auth, handleAuthStateChanged);
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      
      // Clean up auth listener
      if (authListenerRef.current) {
        authListenerRef.current();
        authListenerRef.current = null;
      }
      
      // Clean up all Firestore listeners
      cleanupAllListeners();
    };
  }, []);

  // Improved sign out function with rate limiting and better cleanup
  const signOut = async () => {
    // Prevent multiple concurrent signouts
    if (isSigningOutRef.current) {
      return;
    }
    
    // Rate limit sign outs to prevent rapid sign out/sign in cycles
    const now = Date.now();
    if (now - lastSignOutTimeRef.current < 2000) {
      return;
    }
    
    isSigningOutRef.current = true;
    lastSignOutTimeRef.current = now;
    
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
      
      // Clean up all listeners
      cleanupAllListeners();
      
      // Wait a moment to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Re-set the logout reason in case it was cleared
      sessionStorage.setItem('logoutReason', reason);
      
      // Sign out from Firebase auth
      await firebaseSignOut(auth);
      
      // Set user to null right away for more responsive UI
      if (isMountedRef.current) {
        setUser(null);
        setUserMeta(null);
      }
      
    } catch (err) {
      // Last resort cleanup
      try {
        cleanupAllListeners();
        await firebaseSignOut(auth);
      } catch (e) {
        // Final cleanup attempt failed
      }
    } finally {
      // Give enough time before allowing another sign-out
      setTimeout(() => {
        isSigningOutRef.current = false;
      }, 1000);
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