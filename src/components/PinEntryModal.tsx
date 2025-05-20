import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePinTimeout } from '../../context/PinTimeoutContext';

type PinEntryModalProps = {
  onBack?: () => void;
};

const PinEntryModal: React.FC<PinEntryModalProps> = ({ onBack }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  
  const { 
    verifyPinValue, 
    pinAttempts, 
    isPinLocked, 
    pinLockExpiry,
    hasPin
  } = usePinTimeout();

  // Calculate remaining lock time
  const getRemainingLockTime = () => {
    if (!pinLockExpiry) return null;
    
    const remainingMs = pinLockExpiry - Date.now();
    if (remainingMs <= 0) return null;
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  // Update remaining time every second if PIN is locked
  useEffect(() => {
    if (!isPinLocked || !pinLockExpiry) return;
    
    const timer = setInterval(() => {
      const remaining = getRemainingLockTime();
      if (!remaining) {
        clearInterval(timer);
        setError('');
      } else {
        setError(`PIN terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${remaining}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPinLocked, pinLockExpiry]);
  
  // Set initial error message if PIN is locked
  useEffect(() => {
    if (isPinLocked) {
      const remaining = getRemainingLockTime();
      if (remaining) {
        setError(`PIN terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${remaining}`);
      }
    }
  }, [isPinLocked]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setPin(value);
      setError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPinLocked) {
      const remaining = getRemainingLockTime();
      if (remaining) {
        setError(`PIN terkunci. Coba lagi dalam ${remaining}`);
        return;
      }
    }
    
    if (pin.length < 4) {
      setError('PIN terlalu pendek');
      return;
    }
    
    try {
      const isValid = await verifyPinValue(pin);
      
      if (isValid) {
        // PIN verified successfully
        setPin('');
        setError('');
      } else {
        if (isPinLocked) {
          const remaining = getRemainingLockTime();
          setError(`PIN terkunci. Coba lagi dalam ${remaining}`);
        } else {
          // 5 is the MAX_PIN_ATTEMPTS from the context
          const attemptsLeft = 5 - pinAttempts;
          setError(`PIN tidak valid. ${attemptsLeft} kesempatan tersisa.`);
        }
        setPin('');
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('Terjadi kesalahan, silakan coba lagi');
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // If user doesn't have a PIN set, don't show the modal
  if (!hasPin) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full">
        <div className="text-center mb-4">
          <div className="flex justify-center">
            <Lock className="text-purple-600 h-12 w-12 mb-2" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Dompet Terkunci
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Masukkan PIN untuk mengakses dompet Anda
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              autoFocus
              disabled={isPinLocked}
              className="w-full p-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:dark:text-gray-500"
              placeholder="• • • • • •"
            />
            {error && (
              <div className="mt-2 text-sm text-red-500 flex items-start">
                <AlertTriangle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={pin.length < 4 || isPinLocked}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Buka Kunci
          </button>
        </form>
        
        <button
          onClick={handleBack}
          className="mt-4 text-gray-600 dark:text-gray-400 text-sm hover:underline w-full text-center"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default PinEntryModal;