import React from react
import LayoutShell from ....layoutsLayoutShell

const UpgradePage = () = {
  return (
    LayoutShell
      main className=max-w-screen-md mx-auto px-4 smpx-6 mdpx-8 xlpx-12 2xlpx-20 py-10 mdml-64
        h1 className=text-3xl font-bold text-center mb-6🚀 Upgrade ke Premiumh1

        p className=text-center text-gray-600 darktext-gray-300 mb-8
          Nikmati fitur eksklusif dan tingkatkan pengalaman Anda dengan MoniQ Premium.
        p

        div className=bg-white darkbg-gray-800 rounded-lg shadow-lg p-6 border darkborder-gray-700
          h2 className=text-2xl font-semibold mb-2💎 MoniQ Premiumh2
          ul className=list-disc pl-5 text-sm text-gray-700 darktext-gray-300 space-y-1 mb-4
            liProteksi PIN untuk halaman Walletli
            liFitur analitik keuangan lanjutanli
            liPreferensi tampilan yang lebih lengkapli
            liDukungan prioritas & update lebih awalli
          ul

          div className=text-center text-2xl font-bold text-purple-600 darktext-purple-400 mb-4
            Rp25.000  bulan
          div

          div className=text-center
            button
              onClick={() = alert(Fitur upgrade belum aktif)}  Ganti ini dengan integrasi pembayaran nanti
              className=px-6 py-2 bg-gradient-to-r from-[#00d97e] to-[#00c2ff] text-white rounded-lg font-semibold hovershadow-lg transition
            
              Upgrade Sekarang
            button
          div
        div

        div className=text-center text-xs text-gray-500 darktext-gray-400 mt-6
          Pembayaran saat ini belum tersedia. Fitur akan segera aktif.
        div
      main
    LayoutShell
  )
}

export default UpgradePage
