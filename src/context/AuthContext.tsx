import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface UserMeta {
  role: 'user' | 'premium'
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
  const [loading, setLoading] = useState(true)
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload()
        setUser(currentUser)

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()

          const role = data.role || 'user'
          const start = data.premiumStartDate
          const end = data.premiumEndDate
          const currency = data.preferredCurrency || null

          let daysLeft = 0
          if (end) {
            const today = new Date()
            const endDate = new Date(end)
            const diffTime = endDate.getTime() - today.getTime()
            daysLeft = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0)
          }

          setUserMeta({
            role,
            premiumStartDate: start,
            premiumEndDate: end,
            daysLeft,
            preferredCurrency: currency,
          })
        } else {
          setUserMeta({ role: 'user' })
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
