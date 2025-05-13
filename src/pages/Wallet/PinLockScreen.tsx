import React, { useRef } from "react";

interface PinLockScreenProps {
  visible: boolean;
  pinError: string;
  enteredPin: string;
  onChange: (value: string) => void;
  onUnlock: () => void;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({
  visible,
  pinError,
  enteredPin,
  onChange,
  onUnlock,
}) => {
  const pinInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (visible && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 transition-all duration-300">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Masukkan PIN</h2>
        <input
          type="password"
          maxLength={6}
          className="border rounded-lg w-full px-4 py-2 text-center"
          value={enteredPin}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onUnlock()}
          ref={pinInputRef}
        />
        {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
        <button
          onClick={onUnlock}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full mt-4"
        >
          Buka Kunci
        </button>
      </div>
    </div>
  );
};

export default PinLockScreen;