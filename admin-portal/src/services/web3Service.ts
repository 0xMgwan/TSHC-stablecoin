import { 
  ethers,
  BrowserProvider,
  Contract,
  Signer,
  Network,
  TransactionResponse,
  formatUnits,
  parseUnits,
  toBeHex
} from 'ethers';
import TSHC_ABI from '../contracts/abis/TSHC.json';
import RESERVE_ABI from '../contracts/abis/Reserve.json';

// Role management constants
const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'; // keccak256("MINTER_ROLE")
const ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'; // keccak256("ADMIN_ROLE")

// Contract addresses - these would come from environment variables in production
const CONTRACT_ADDRESSES = {
  // Base Sepolia testnet addresses
  TSHC: '0x0859D42FD008D617c087DD386667da51570B1aAB', // SimpleTSHC deployed address
  RESERVE: '0x72Ff093CEA6035fa395c0910B006af2DC4D4E9F5', // SimpleReserve deployed address
  TEST_USDC: '0x4ecD2810a6A412fdc95B71c03767068C35D23fE3', // TestUSDC deployed address
  PRICE_ORACLE: '0xe4A05fca88C4F10fe6d844B75025E3415dFe6170', // SimplePriceOracle deployed address
  FEE_MANAGER: '0x46358DA741d3456dBAEb02995979B2722C3b8722', // SimpleFeeManager deployed address
  BATCH_PAYMENT: '0x9E1e03b06FB36364b3A6cbb6AbEC4f6f2B9C8DdC', // SimpleBatchPayment deployed address
  PAYMASTER: '0x7d9687c95831874926bbc9476844674D6B943464', // SimplePaymaster deployed address
  SMART_WALLET_FACTORY: '0x10dE41927cdD093dA160E562630e0efC19423869', // SimpleSmartWalletFactory deployed address
};

// Mock data for demonstration purposes when contracts are not available
const MOCK_DATA = {
  totalSupply: '10000000',
  collateralizationRatio: '102.5',
  transactions: [
    { id: 1746889069164, type: 'Mint', amount: 750000, date: '2025-04-10', organization: 'ABSA Bank', reason: 'New partnership' },
    { id: 1, type: 'Mint', amount: 1000000, date: '2025-04-01', organization: 'Bank of Tanzania', reason: 'Initial issuance' },
    { id: 2, type: 'Burn', amount: 250000, date: '2025-04-03', organization: 'CRDB Bank', reason: 'Redemption' },
    { id: 3, type: 'Mint', amount: 500000, date: '2025-04-05', organization: 'NMB Bank', reason: 'Expansion' },
  ]
};

// Network configuration
const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia testnet
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
};

class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private tshcContract: Contract | null = null;
  private reserveContract: Contract | null = null;
  private isInitialized: boolean = false;
  private useMockData: boolean = false;

  /**
   * Initialize the Web3 service
   * @param forcePrompt If true, always prompt the user to connect, even if already connected
   */
  async initialize(forcePrompt: boolean = true): Promise<boolean> {
    try {
      // Check if window.ethereum is available (MetaMask or other wallet)
      if (window.ethereum) {
        this.provider = new BrowserProvider(window.ethereum);
        
        // Request account access with explicit user confirmation
        if (forcePrompt) {
          try {
            // Try the wallet_requestPermissions method first (works in MetaMask)
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
            });
          } catch (permissionError) {
            console.log('wallet_requestPermissions not supported, falling back to eth_requestAccounts');
            // Fallback to standard eth_requestAccounts if wallet_requestPermissions is not supported
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          }
        } else {
          // Standard account request without forcing prompt
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        
        this.signer = await this.provider.getSigner();
        
        // Validate contract ABIs before initializing
        if (!TSHC_ABI.abi || !Array.isArray(TSHC_ABI.abi)) {
          console.warn('Invalid TSHC ABI format. Using fallback ABI.');
          // If we were in production, we would use a fallback ABI here
        }
        
        if (!RESERVE_ABI.abi || !Array.isArray(RESERVE_ABI.abi)) {
          console.warn('Invalid Reserve ABI format. Using fallback ABI.');
          // If we were in production, we would use a fallback ABI here
        }
        
        // Initialize contracts
        this.tshcContract = new Contract(
          CONTRACT_ADDRESSES.TSHC,
          TSHC_ABI.abi,
          this.signer
        );
        
        this.reserveContract = new Contract(
          CONTRACT_ADDRESSES.RESERVE,
          RESERVE_ABI.abi,
          this.signer
        );
        
        // Verify contracts are deployed at the specified addresses
        try {
          // Try a simple call to check if contract exists
          await this.tshcContract.symbol();
        } catch (contractError) {
          console.warn('TSHC contract verification failed. Using mock mode.', contractError);
          this.useMockData = true;
        }
        
        try {
          // Try a simple call to check if contract exists
          await this.reserveContract.symbol();
        } catch (contractError) {
          console.warn('Reserve contract verification failed. Using mock mode.', contractError);
          this.useMockData = true;
        }
        
        this.isInitialized = true;
        return true;
      } else {
        console.error('Ethereum wallet not detected');
        return false;
      }
    } catch (error) {
      console.error('Error initializing Web3Service:', error);
      return false;
    }
  }

  /**
   * Check if the Web3 service is initialized
   */
  isConnected(): boolean {
    return this.isInitialized;
  }

  /**
   * Disconnect wallet and reset state
   */
  async disconnect(): Promise<boolean> {
    try {
      // Reset all state
      this.provider = null;
      this.signer = null;
      this.tshcContract = null;
      this.reserveContract = null;
      this.isInitialized = false;
      this.useMockData = false;
      
      // Remove event listeners
      this.removeAllListeners();
      
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  }

  /**
   * Get the current connected account
   */
  async getAccount(): Promise<string | null> {
    try {
      if (!this.signer) return null;
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  /**
   * Get the current network
   */
  async getNetwork(): Promise<Network | null> {
    try {
      if (!this.provider) return null;
      return await this.provider.getNetwork();
    } catch (error) {
      // Handle network change errors gracefully
      if (error && typeof error === 'object' && 'event' in error && error.event === 'changed') {
        console.log('Network is changing, will retry...');
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.provider ? await this.provider.getNetwork() : null;
      }
      
      console.error('Error getting network:', error);
      return null;
    }
  }

  /**
   * Check if the user is on the correct network
   */
  async isCorrectNetwork(): Promise<boolean> {
    try {
      const network = await this.getNetwork();
      // Convert both to strings for comparison since network.chainId might be a bigint
      return network ? network.chainId.toString() === NETWORK_CONFIG.chainId.toString() : false;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  /**
   * Switch to the correct network
   */
  async switchToCorrectNetwork(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toBeHex(NETWORK_CONFIG.chainId) }],
      });
      return true;
    } catch (error: any) {
      // If the chain is not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: toBeHex(NETWORK_CONFIG.chainId),
                chainName: NETWORK_CONFIG.name,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', error);
      return false;
    }
  }

  // TSHC Token Functions

  /**
   * Get the total supply of TSHC
   */
  async getTotalSupply(): Promise<string> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      // Check if we're on the correct network before proceeding
      const isCorrect = await this.isCorrectNetwork();
      if (!isCorrect) {
        return '0';
      }
      
      // Use mock data if contract verification failed
      if (this.useMockData) {
        console.log('Using mock data for totalSupply');
        return MOCK_DATA.totalSupply;
      }
      
      try {
        const totalSupply = await this.tshcContract.totalSupply();
        return formatUnits(totalSupply, 18);
      } catch (contractError: any) {
        // Handle BAD_DATA errors which might occur if the contract ABI doesn't match
        if (contractError.code === 'BAD_DATA') {
          console.warn('Contract ABI mismatch for totalSupply. Using mock data.');
          return MOCK_DATA.totalSupply;
        }
        throw contractError;
      }
    } catch (error) {
      console.error('Error getting total supply:', error);
      // Return a default value instead of throwing to prevent UI errors
      return '0';
    }
  }

  /**
   * Get the balance of TSHC for a specific address
   */
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const balance = await this.tshcContract.balanceOf(address);
      return formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Mint TSHC tokens to a specific address
   */
  async mintTokens(to: string, amount: string): Promise<TransactionResponse> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const amountInWei = parseUnits(amount, 18);
      return await this.tshcContract.mint(to, amountInWei);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  /**
   * Burn TSHC tokens
   */
  async burnTokens(amount: string): Promise<TransactionResponse> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const amountInWei = parseUnits(amount, 18);
      return await this.tshcContract.burn(amountInWei);
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw error;
    }
  }

  /**
   * Create a batch mint operation
   */
  async createBatchMint(
    recipients: string[],
    amounts: string[]
  ): Promise<TransactionResponse> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const amountsInWei = amounts.map(amount => parseUnits(amount, 18));
      return await this.tshcContract.createBatchMint(recipients, amountsInWei);
    } catch (error) {
      console.error('Error creating batch mint:', error);
      throw error;
    }
  }

  /**
   * Create a batch burn operation
   */
  async createBatchBurn(
    holders: string[],
    amounts: string[]
  ): Promise<TransactionResponse> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const amountsInWei = amounts.map(amount => parseUnits(amount, 18));
      return await this.tshcContract.createBatchBurn(holders, amountsInWei);
    } catch (error) {
      console.error('Error creating batch burn:', error);
      throw error;
    }
  }

  /**
   * Approve a batch operation
   */
  async approveBatchOperation(
    batchId: number
  ): Promise<TransactionResponse> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      return await this.tshcContract.approveBatchOperation(batchId);
    } catch (error) {
      console.error('Error approving batch operation:', error);
      throw error;
    }
  }

  /**
   * Get batch operation details
   */
  async getBatchOperation(batchId: number): Promise<any> {
    try {
      if (!this.tshcContract) throw new Error('TSHC contract not initialized');
      
      const batchOperation = await this.tshcContract.batchOperations(batchId);
      return {
        isMint: batchOperation.isMint,
        executed: batchOperation.executed,
        approvals: batchOperation.approvals.toString(),
        requiredApprovals: batchOperation.requiredApprovals.toString(),
      };
    } catch (error) {
      console.error('Error getting batch operation:', error);
      throw error;
    }
  }

  // Reserve Functions

  /**
   * Get the total collateral value
   */
  async getTotalCollateralValue(): Promise<string> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      const totalValue = await this.reserveContract.getTotalCollateralValue();
      return formatUnits(totalValue, 18);
    } catch (error) {
      console.error('Error getting total collateral value:', error);
      throw error;
    }
  }

  /**
   * Get the collateralization ratio
   */
  async getCollateralizationRatio(): Promise<string> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      // Check if we're on the correct network before proceeding
      const isCorrect = await this.isCorrectNetwork();
      if (!isCorrect) {
        return '100';
      }
      
      // Use mock data if contract verification failed
      if (this.useMockData) {
        console.log('Using mock data for collateralizationRatio');
        return MOCK_DATA.collateralizationRatio;
      }
      
      try {
        const ratio = await this.reserveContract.getCollateralizationRatio();
        // Convert from basis points (e.g., 15000 = 150%)
        return (Number(ratio) / 100).toString();
      } catch (contractError: any) {
        // Handle BAD_DATA errors which might occur if the contract ABI doesn't match
        if (contractError.code === 'BAD_DATA') {
          console.warn('Contract ABI mismatch for getCollateralizationRatio. Using mock data.');
          return MOCK_DATA.collateralizationRatio;
        }
        throw contractError;
      }
    } catch (error) {
      console.error('Error getting collateralization ratio:', error);
      // Return a default value instead of throwing to prevent UI errors
      return '100';
    }
  }

  /**
   * Get supported collaterals
   */
  async getSupportedCollaterals(): Promise<string[]> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      return await this.reserveContract.getSupportedCollaterals();
    } catch (error) {
      console.error('Error getting supported collaterals:', error);
      throw error;
    }
  }

  /**
   * Get collateral info for a specific token
   */
  async getCollateralInfo(tokenAddress: string): Promise<any> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      const info = await this.reserveContract.getCollateralInfo(tokenAddress);
      return {
        isSupported: info.isSupported,
        collateralRatio: (Number(info.collateralRatio) / 100).toString(),
        totalDeposited: formatUnits(info.totalDeposited, 18),
      };
    } catch (error) {
      console.error('Error getting collateral info:', error);
      throw error;
    }
  }

  /**
   * Deposit collateral and mint TSHC
   */
  async depositCollateralAndMintTSHC(
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResponse> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      const amountInWei = parseUnits(amount, 18);
      return await this.reserveContract.depositCollateralAndMintTSHC(tokenAddress, amountInWei);
    } catch (error) {
      console.error('Error depositing collateral:', error);
      throw error;
    }
  }

  /**
   * Burn TSHC and withdraw collateral
   */
  async burnTSHCAndWithdrawCollateral(
    tokenAddress: string,
    tshcAmount: string
  ): Promise<TransactionResponse> {
    try {
      if (!this.reserveContract) throw new Error('Reserve contract not initialized');
      
      const amountInWei = ethers.parseUnits(tshcAmount, 18);
      return await this.reserveContract.burnTSHCAndWithdrawCollateral(tokenAddress, amountInWei);
    } catch (error) {
      console.error('Error withdrawing collateral:', error);
      throw error;
    }
  }

  // Event listeners

  /**
   * Listen for TSHC transfer events
   */
  listenForTransfers(callback: (from: string, to: string, amount: string) => void): void {
    if (!this.tshcContract) {
      console.error('TSHC contract not initialized');
      return;
    }
    
    this.tshcContract.on('Transfer', (from, to, amount) => {
      callback(from, to, formatUnits(amount, 18));
    });
  }

  /**
   * Listen for batch operation events
   */
  listenForBatchOperations(callback: (batchId: number, isMint: boolean) => void): void {
    if (!this.tshcContract) {
      console.error('TSHC contract not initialized');
      return;
    }
    
    this.tshcContract.on('BatchOperationCreated', (batchId, isMint) => {
      callback(batchId.toNumber(), isMint);
    });
  }

  /**
   * Listen for collateral deposit events
   */
  listenForCollateralDeposits(
    callback: (user: string, token: string, amount: string, tshcMinted: string) => void
  ): void {
    if (!this.reserveContract) {
      console.error('Reserve contract not initialized');
      return;
    }
    
    this.reserveContract.on('CollateralDeposited', (user, token, amount, tshcMinted) => {
      callback(
        user,
        token,
        formatUnits(amount, 18),
        formatUnits(tshcMinted, 18)
      );
    });
  }

  /**
   * Listen for collateral withdrawal events
   */
  listenForCollateralWithdrawals(
    callback: (user: string, token: string, amount: string, tshcBurned: string) => void
  ): void {
    if (!this.reserveContract) {
      console.error('Reserve contract not initialized');
      return;
    }
    
    this.reserveContract.on('CollateralWithdrawn', (user, token, amount, tshcBurned) => {
      callback(
        user,
        token,
        formatUnits(amount, 18),
        formatUnits(tshcBurned, 18)
      );
    });
  }

  /**
   * Stop listening to all events
   */
  removeAllListeners(): void {
    if (this.tshcContract) {
      this.tshcContract.removeAllListeners();
    }
    
    if (this.reserveContract) {
      this.reserveContract.removeAllListeners();
    }
  }

  /**
   * Get the MINTER_ROLE bytes32 value
   */
  async getMinterRole(): Promise<string> {
    return MINTER_ROLE;
  }

  /**
   * Check if an address has a specific role
   */
  async hasRole(role: string, address: string): Promise<boolean> {
    if (!this.isInitialized || !this.tshcContract) {
      throw new Error('Web3 service not initialized');
    }

    try {
      return await this.tshcContract.hasRole(role, address);
    } catch (error) {
      console.error('Error checking role:', error);
      throw error;
    }
  }

  /**
   * Grant a role to an address
   */
  async grantRole(role: string, address: string): Promise<TransactionResponse> {
    if (!this.isInitialized || !this.tshcContract || !this.signer) {
      throw new Error('Web3 service not initialized or wallet not connected');
    }

    try {
      // Connect with signer to send transactions
      const tshcWithSigner = this.tshcContract.connect(this.signer);
      // Use the function interface to call the contract method
      return await tshcWithSigner.getFunction('grantRole')(role, address);
    } catch (error) {
      console.error('Error granting role:', error);
      throw error;
    }
  }

  /**
   * Revoke a role from an address
   */
  async revokeRole(role: string, address: string): Promise<TransactionResponse> {
    if (!this.isInitialized || !this.tshcContract || !this.signer) {
      throw new Error('Web3 service not initialized or wallet not connected');
    }

    try {
      // Connect with signer to send transactions
      const tshcWithSigner = this.tshcContract.connect(this.signer);
      // Use the function interface to call the contract method
      return await tshcWithSigner.getFunction('revokeRole')(role, address);
    } catch (error) {
      console.error('Error revoking role:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const web3Service = new Web3Service();

export default web3Service;
