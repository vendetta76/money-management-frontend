import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "../lib/firebaseClient"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebaseClient"

interface UserMeta {
  role: "regular" | "premium"
  premiumStartDate?: string
  premiumEndDate?: string
  daysLeft?: number
  preferredCurrency?: {
    code: string
    locale: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  userMeta: UserMeta | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload()
        setUser(currentUser);
        window.firebaseUser = currentUser;

        try {
          const docRef = doc(db, "users", currentUser.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const data = docSnap.data()

            const role = data.role || "regular"
            console.log("✅ [AuthContext] role loaded:", role);
            const premiumStartDate = data.premiumStartDate
            const premiumEndDate = data.premiumEndDate
            const preferredCurrency = data.preferredCurrency || null

            let daysLeft = 0
            if (premiumEndDate) {
              const today = new Date()
              const end = new Date(premiumEndDate)
              const diff = end.getTime() - today.getTime()
              daysLeft = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
            }

            setUserMeta({
              role,
              premiumStartDate,
              premiumEndDate,
              daysLeft,
              preferredCurrency,
            })
          } else {
            // Default meta for new users without Firestore entry
            setUserMeta({ role: "regular" })
          }
        } catch (err) {
          console.error("Error loading userMeta:", err)
          setUserMeta({ role: "regular" }) // fallback safe
        }
      } else {
        setUser(null)
        setUserMeta(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, userMeta }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
