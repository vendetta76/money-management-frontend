import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TourProps {
  run: boolean;
  onEnd: () => void;
}

const steps: Step[] = [
  {
    target: "body",
    content: "Selamat datang di MeowIQ! Yuk mulai tur singkat fitur utamanya.",
    placement: "center",
  },
  {
    target: "#tour-wallet-card",
    content: "Ini dompet digital kamu. Saldo di sini akan berubah sesuai transaksi.",
  },
  {
    target: "#tour-income-btn",
    content: "Klik di sini untuk menambahkan pemasukan seperti gaji atau bonus.",
  },
  {
    target: "#tour-expense-btn",
    content: "Gunakan ini untuk mencatat pengeluaran kamu.",
  },
  {
    target: "#tour-transfer-btn",
    content: "Kamu bisa transfer antar dompet di sini.",
  },
  {
    target: "#tour-transaction-list",
    content: "Semua transaksi terbaru kamu akan muncul di sini.",
  },
  {
    target: "#tour-report-btn",
    content: "Ada masukan atau bug? Kirim laporanmu lewat sini ya!",
  },
];

const Tour: React.FC<TourProps> = ({ run, onEnd }) => {
  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
    if (finished) onEnd();
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleCallback}
      showSkipButton
      continuous
      scrollToFirstStep
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#00bcd4",
          textColor: "#333",
        },
      }}
    />
  );
};

export default Tour;