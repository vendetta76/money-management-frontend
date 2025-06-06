
import React from "react";

interface PinModalProps {
  visible: boolean;
  enteredPin: string;
  setEnteredPin: (pin: string) => void;
  onUnlock: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ visible, enteredPin, setEnteredPin, onUnlock }) => {
  if (!visible) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[PinModal] User mengetik PIN:", e.target.value);
    setEnteredPin(e.target.value);
  };

  const handleUnlockClick = () => {
    console.log("[PinModal] Tombol buka diklik dengan PIN:", enteredPin);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Masukkan PIN</h2>
        <input
          type="password"
          className="border rounded w-full px-3 py-2 mb-4"
          value={enteredPin}
          onChange={handleInputChange}
          placeholder="PIN"
        />
        <button
          onClick={handleUnlockClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Buka Kunci
        </button>
      </div>
    </div>
  );
};

export default PinModal;
