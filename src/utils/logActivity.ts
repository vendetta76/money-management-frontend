import { db } from "../../firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export const logActivity = async (
  userEmail: string,
  action: string
): Promise<void> => {
  try {
    await addDoc(collection(db, "logs"), {
      userEmail,
      action,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error)
  }
}
