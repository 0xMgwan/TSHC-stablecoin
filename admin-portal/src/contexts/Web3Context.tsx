import React, { createContext, useState, useEffect, useCallback } from 'react';
import web3Service from '../services/web3Service';

interface Web3ContextType {
  isInitialized: boolean;
  isConnecting: boolean;
  account: string | null;
  isCorrectNetwork: boolean;
  totalSupply: string;
  collateralizationRatio: string;
  userBalance: string;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<boolean>;
  switchNetwork: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  mintTokens: (to: string, amount: string) => Promise<any>;
  burnTokens: (amount: string) => Promise<any>;
  createBatchMint: (recipients: string[], amounts: string[]) => Promise<any>;
  createBatchBurn: (holders: string[], amounts: string[]) => Promise<any>;
  approveBatchOperation: (batchId: number) => Promise<any>;
  error: string | null;
}

export const Web3Context = createContext<Web3ContextType>({
  isInitialized: false,
  isConnecting: false,
  account: null,
  isCorrectNetwork: false,
  totalSupply: '0',
  collateralizationRatio: '0',
  userBalance: '0',
  connectWallet: async () => false,
  disconnectWallet: async () => false,
  switchNetwork: async () => false,
  refreshData: async () => {},
  mintTokens: async () => ({}),
  burnTokens: async () => ({}),
  createBatchMint: async () => ({}),
  createBatchBurn: async () => ({}),
  approveBatchOperation: async () => ({}),
  error: null,
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [collateralizationRatio, setCollateralizationRatio] = useState<string>('0');
  const [userBalance, setUserBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  // Connect wallet function
  const connectWallet = async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Check if window.ethereum exists
      if (!window.ethereum) {
        setError('No Ethereum wallet detected. Please install MetaMask or another compatible wallet.');
        return false;
      }
      
      // Try to initialize with better error handling
      try {
        const success = await web3Service.initialize();
        
        if (success) {
          setIsInitialized(true);
          
          // Get account
          const account = await web3Service.getAccount();
          setAccount(account);
          
          // Check network
          const correctNetwork = await web3Service.isCorrectNetwork();
          setIsCorrectNetwork(correctNetwork);
          
          // If on correct network, fetch data
          if (correctNetwork) {
            await refreshData();
          } else {
            setError(`Please switch to ${process.env.REACT_APP_NETWORK_NAME || 'the correct network'}`);
          }
          
          return true;
        } else {
          setError('Failed to initialize wallet connection. Please try again.');
          return false;
        }
      } catch (initError: any) {
        console.error('Wallet initialization error:', initError);
        setError(initError.message || 'Error connecting to wallet. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async (): Promise<boolean> => {
    try {
      setError(null);
      await web3Service.disconnect();
      
      // Reset state
      setIsInitialized(false);
      setAccount(null);
      setIsCorrectNetwork(false);
      setTotalSupply('0');
      setCollateralizationRatio('0');
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
      return false;
    }
  };

  // Switch network function
  const switchNetwork = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await web3Service.switchToCorrectNetwork();
      
      if (success) {
        setIsCorrectNetwork(true);
        await refreshData();
      }
      
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      return false;
    }
  };

  // Refresh data function
  const refreshData = async (): Promise<void> => {
    try {
      setError(null);
      
      // Only fetch data if initialized and on correct network
      if (isInitialized && isCorrectNetwork) {
        try {
          // Get total supply
          const supply = await web3Service.getTotalSupply();
          setTotalSupply(supply);
        } catch (supplyErr) {
          console.warn('Error fetching total supply:', supplyErr);
          // Continue execution to try getting other data
        }
        
        try {
          // Get collateralization ratio
          const ratio = await web3Service.getCollateralizationRatio();
          setCollateralizationRatio(ratio);
        } catch (ratioErr) {
          console.warn('Error fetching collateralization ratio:', ratioErr);
          // Continue execution
        }
        
        try {
          // Get user balance if account is available
          if (account) {
            const balance = await web3Service.getBalance(account);
            setUserBalance(balance);
          }
        } catch (balanceErr) {
          console.warn('Error fetching user balance:', balanceErr);
          // Continue execution
        }
      }
    } catch (err: any) {
      console.error('General refresh error:', err);
      // Only set user-facing errors for critical failures
      if (err.code !== 'NETWORK_ERROR') {
        setError(err.message || 'Failed to refresh data');
      }
    }
  };

  // Mint tokens function
  const mintTokens = async (to: string, amount: string) => {
    try {
      setError(null);
      return await web3Service.mintTokens(to, amount);
    } catch (err: any) {
      setError(err.message || 'Failed to mint tokens');
      throw err;
    }
  };

  // Burn tokens function
  const burnTokens = async (amount: string) => {
    try {
      setError(null);
      return await web3Service.burnTokens(amount);
    } catch (err: any) {
      setError(err.message || 'Failed to burn tokens');
      throw err;
    }
  };

  // Create batch mint function
  const createBatchMint = async (recipients: string[], amounts: string[]) => {
    try {
      setError(null);
      return await web3Service.createBatchMint(recipients, amounts);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch mint');
      throw err;
    }
  };

  // Create batch burn function
  const createBatchBurn = async (holders: string[], amounts: string[]) => {
    try {
      setError(null);
      return await web3Service.createBatchBurn(holders, amounts);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch burn');
      throw err;
    }
  };

  // Approve batch operation function
  const approveBatchOperation = async (batchId: number) => {
    try {
      setError(null);
      return await web3Service.approveBatchOperation(batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to approve batch operation');
      throw err;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setAccount(null);
          setIsInitialized(false);
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          
          // Refresh data with new account
          if (isCorrectNetwork) {
            await refreshData();
          }
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account, isCorrectNetwork]);

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async () => {
        try {
          // Check if on correct network
          const correctNetwork = await web3Service.isCorrectNetwork();
          setIsCorrectNetwork(correctNetwork);
          
          // Refresh data if on correct network
          if (correctNetwork) {
            await refreshData();
          }
        } catch (err) {
          console.log('Network change handling error:', err);
          // Don't set error state here as network changes can be temporary
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Setup event listeners for transfers, batch operations, etc.
  useEffect(() => {
    if (isInitialized && isCorrectNetwork) {
      // Listen for transfers
      web3Service.listenForTransfers((from, to, amount) => {
        // Refresh data when transfers occur
        refreshData();
      });
      
      // Listen for batch operations
      web3Service.listenForBatchOperations((batchId, isMint) => {
        // Refresh data when batch operations are created
        refreshData();
      });
      
      // Listen for collateral deposits
      web3Service.listenForCollateralDeposits((user, token, amount, tshcMinted) => {
        // Refresh data when collateral is deposited
        refreshData();
      });
      
      // Listen for collateral withdrawals
      web3Service.listenForCollateralWithdrawals((user, token, amount, tshcBurned) => {
        // Refresh data when collateral is withdrawn
        refreshData();
      });
      
      return () => {
        // Remove all listeners when component unmounts
        web3Service.removeAllListeners();
      };
    }
  }, [isInitialized, isCorrectNetwork]);

  return (
    <Web3Context.Provider value={{
      isInitialized,
      isConnecting,
      account,
      isCorrectNetwork,
      totalSupply,
      collateralizationRatio,
      userBalance,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      refreshData,
      mintTokens,
      burnTokens,
      createBatchMint,
      createBatchBurn,
      approveBatchOperation,
      error
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => React.useContext(Web3Context);
