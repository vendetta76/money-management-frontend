import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

interface UserMeta {
  role: "Regular" | "Premium" | "Admin";
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
          const docSnap = await getDoc(docRef);

          let role: "Regular" | "Premium" | "Admin" = hasAdminClaim ? "Admin" : "Regular";

          if (docSnap.exists()) {
            const data = docSnap.data();
            const firestoreRole = data.role || "Regular";

            if (hasAdminClaim) {
              role = "Admin";
              if (firestoreRole !== "Admin") {
                await setDoc(docRef, { role: "Admin" }, { merge: true });
              }
            } else {
              role = firestoreRole === "premium"
                ? "Premium"
                : firestoreRole === "admin"
                ? "Admin"
                : "Regular";
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
            await setDoc(docRef, { role }, { merge: true });
          }
        } catch (err) {
          console.error("Error loading userMeta:", err);
          setUserMeta({ role: "Regular" });
        }
      } else {
        setUser(null);
        setUserMeta(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
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
