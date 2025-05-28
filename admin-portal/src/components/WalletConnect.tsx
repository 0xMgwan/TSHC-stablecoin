import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Chip, 
  CircularProgress,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

const WalletConnect: React.FC = () => {
  const { 
    isInitialized, 
    isConnecting, 
    account, 
    isCorrectNetwork,
    connectWallet,
    switchNetwork,
    error,
    disconnectWallet
  } = useWeb3();
  
  // Local state for error handling
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);

  // Format account address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle connect wallet button click with retry logic
  const handleConnectWallet = async () => {
    setConnectionAttempts(prev => prev + 1);
    setShowErrorAlert(false);
    
    try {
      const success = await connectWallet();
      if (!success && error) {
        setShowErrorAlert(true);
      }
    } catch (err) {
      console.error('Error in wallet connection handler:', err);
      setShowErrorAlert(true);
    }
  };

  // Handle switch network button click
  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork();
    } catch (err) {
      console.error('Error switching network:', err);
      setShowErrorAlert(true);
    }
  };

  // Handle disconnect wallet button click
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };
  
  // Handle error alert close
  const handleCloseAlert = () => {
    setShowErrorAlert(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {isInitialized && account ? (
        <>
          {!isCorrectNetwork ? (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={handleSwitchNetwork}
              startIcon={<WarningIcon />}
            >
              Switch Network
            </Button>
          ) : (
            <Tooltip title="Connected to Base network">
              <Chip
                icon={<CheckIcon />}
                label="Base"
                color="success"
                size="small"
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}
          
          <Tooltip title={account}>
            <Chip
              icon={<WalletIcon />}
              label={formatAddress(account)}
              color="primary"
              variant="outlined"
              sx={{ 
                color: theme => theme.palette.mode === 'light' ? theme.palette.primary.main : 'inherit',
                borderColor: theme => theme.palette.mode === 'light' ? theme.palette.primary.main : 'inherit'
              }}
            />
          </Tooltip>
          
          <Tooltip title="Disconnect wallet">
            <IconButton 
              onClick={handleDisconnectWallet}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectWallet}
          startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <WalletIcon />}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      
      {/* Error alert is now handled via Snackbar for better UX */}
      <Snackbar 
        open={showErrorAlert && !!error} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={handleCloseAlert}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleConnectWallet}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Wallet Connection Error</AlertTitle>
          {error || 'Failed to connect wallet. Please try again or use a different wallet.'}
          {connectionAttempts > 1 && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              If you're using MetaMask, please make sure it's unlocked and you've granted permission to this site.
            </Typography>
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WalletConnect;
