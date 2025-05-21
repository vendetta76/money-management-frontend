import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.reload();
          const tokenResult = await currentUser.getIdTokenResult(true);
          console.log("💠 Custom claims:", tokenResult.claims);
          const hasAdminClaim = tokenResult.claims?.Admin === true;

          setUser(currentUser);
          window.firebaseUser = currentUser;

          const docRef = doc(db, "users", currentUser.uid);

          // First check if document exists and create it if needed
          try {
            const docSnapshot = await getDoc(docRef);
            
            if (!docSnapshot.exists()) {
              console.log("✅ [AuthContext] Creating new user document");
              const initialRole = hasAdminClaim ? "Admin" : "Regular";
              await setDoc(docRef, { role: initialRole }, { merge: true });
            }
          } catch (err) {
            console.error("Error checking/creating user document:", err);
          }

          // Now set up snapshot listener with proper error handling
          let unsubListener = () => {};
          
          try {
            unsubListener = onSnapshot(docRef, async (docSnap) => {
              let role: UserMeta["role"] = hasAdminClaim ? "Admin" : "Regular";

              if (docSnap.exists()) {
                const data = docSnap.data();
                const firestoreRole = data.role || "Regular";
                const allowedRoles = ["Regular", "Premium", "Admin", "Staff", "Tester"];

                if (hasAdminClaim) {
                  role = "Admin";
                  if (firestoreRole !== "Admin") {
                    try {
                      await setDoc(docRef, { role: "Admin" }, { merge: true });
                    } catch (err) {
                      console.error("Error updating admin role:", err);
                    }
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

                console.log("✅ [AuthContext] role loaded:", role);
                setUserMeta({ role, premiumStartDate, premiumEndDate, daysLeft, preferredCurrency });
              } else {
                console.log("✅ [AuthContext] new user role:", role);
                setUserMeta({ role });
                try {
                  await setDoc(docRef, { role }, { merge: true });
                } catch (err) {
                  console.error("Error creating new user document:", err);
                }
              }
              setLoading(false);
            }, (error) => {
              // Handle snapshot listener errors
              console.error("Snapshot listener error:", error);
              // Set default role if there's an error
              setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
              setLoading(false);
            });
          } catch (err) {
            console.error("Error setting up snapshot listener:", err);
            setUserMeta({ role: hasAdminClaim ? "Admin" : "Regular" });
            setLoading(false);
          }
          
          return () => {
            unsubListener();
          };
        } catch (err) {
          console.error("Error loading userMeta:", err);
          setUserMeta({ role: "Regular" });
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserMeta(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Set session termination reason
      sessionStorage.setItem('logoutReason', 'userAction');
      
      // Clear other stored data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Error during signOut:", err);
      // Force cleanup even if there's an error
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
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