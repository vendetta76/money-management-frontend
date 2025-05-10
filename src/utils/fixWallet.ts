import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
  } from "firebase/firestore"
  import { db } from "../lib/firebaseClient" // sesuaikan dengan path lo
  
  export const fixAllWalletBalances = async (userId: string) => {
    try {
      const walletsSnap = await getDocs(collection(db, "users", userId, "wallets"))
  
      for (const walletDoc of walletsSnap.docs) {
        const walletId = walletDoc.id
  
        const incomeSnap = await getDocs(query(
          collection(db, "users", userId, "incomes"),
          where("wallet", "==", walletId)
        ))
        const outcomeSnap = await getDocs(query(
          collection(db, "users", userId, "outcomes"),
          where("wallet", "==", walletId)
        ))
  
        const totalIncome = incomeSnap.docs.reduce((acc, d) => acc + (d.data().amount || 0), 0)
        const totalOutcome = outcomeSnap.docs.reduce((acc, d) => acc + (d.data().amount || 0), 0)
        const finalBalance = totalIncome - totalOutcome
  
        await updateDoc(doc(db, "users", userId, "wallets", walletId), {
          balance: finalBalance,
        })
  
        console.log(`✅ ${walletId}: Rp ${finalBalance.toLocaleString("id-ID")}`)
      }
  
      console.log("🔥 Semua saldo wallet berhasil diperbaiki.")
    } catch (err) {
      console.error("❌ Gagal rekalibrasi saldo:", err)
    }
  }
  