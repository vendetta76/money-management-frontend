import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip, IconButton } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { usePinTimeout } from '@/context/PinTimeoutContext';

interface WalletLockButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  iconOnly?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const WalletLockButton: React.FC<WalletLockButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  iconOnly = false,
  color = 'primary'
}) => {
  const navigate = useNavigate();
  const { lockPin, hasPin } = usePinTimeout();

  // If user doesn't have a PIN set, this button shouldn't be visible
  if (!hasPin) {
    return null;
  }

  const handleLockWallet = () => {
    // Lock the PIN manually
    lockPin();
    
    // Optional: Navigate to wallet page to force PIN verification
    // This is helpful if the user is currently on a different page
    navigate('/wallet');
  };

  if (iconOnly) {
    return (
      <Tooltip title="Kunci Dompet" arrow>
        <IconButton
          onClick={handleLockWallet}
          size={size}
          color={color}
          aria-label="Kunci dompet"
        >
          <LockIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      onClick={handleLockWallet}
      startIcon={<LockIcon />}
    >
      Kunci Dompet
    </Button>
  );
};

export default WalletLockButton;