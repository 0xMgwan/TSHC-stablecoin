import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  AccountBalance as ReservesIcon,
  MonetizationOn as MintIcon,
  Delete as BurnIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

// Mock data for mint/burn history
const mockMintBurnHistory = [
  { 
    id: 1, 
    type: 'Mint', 
    amount: 100000, 
    date: '2025-04-16', 
    authorizedBy: 'Admin', 
    organization: 'NEDA Pay',
    reason: 'Testing TSHC token',
    txHash: '0x0859D42FD008D617c087DD386667da51570B1aAB'
  },
  { 
    id: 2, 
    type: 'Burn', 
    amount: 50000, 
    date: '2025-04-16', 
    authorizedBy: 'Admin', 
    organization: 'NEDA Pay',
    reason: 'Testing burn functionality',
    txHash: '0x0859D42FD008D617c087DD386667da51570B1aAB'
  },
  { 
    id: 3, 
    type: 'Deposit', 
    amount: 1000000, 
    date: '2025-04-16', 
    authorizedBy: 'Admin', 
    organization: 'NEDA Pay',
    reason: 'TestUSDC collateral deposit',
    txHash: '0x4ecD2810a6A412fdc95B71c03767068C35D23fE3'
  }
];

const MintBurn: React.FC = () => {
  const theme = useTheme();
  const { 
    isInitialized, 
    isCorrectNetwork, 
    account, 
    totalSupply, 
    collateralizationRatio,
    mintTokens, 
    burnTokens,
    connectWallet,
    switchNetwork,
    refreshData,
    error: web3Error
  } = useWeb3();
  
  const [openMintDialog, setOpenMintDialog] = useState(false);
  const [openBurnDialog, setOpenBurnDialog] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [reason, setReason] = useState('');
  const [organization, setOrganization] = useState('');
  const [mintSuccess, setMintSuccess] = useState(false);
  const [burnSuccess, setBurnSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintBurnHistory, setMintBurnHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total minted and burned
  const totalMinted = mintBurnHistory
    .filter(item => item.type === 'Mint')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const totalBurned = mintBurnHistory
    .filter(item => item.type === 'Burn')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const netCirculating = parseFloat(totalSupply);
  
  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (isInitialized && isCorrectNetwork) {
        setIsLoading(true);
        try {
          // In a real implementation, we would fetch this from the blockchain
          // by querying Transfer events from the TSHC contract
          // For now, we'll use the mock data
          setMintBurnHistory(mockMintBurnHistory);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch transaction history');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchTransactionHistory();
  }, [isInitialized, isCorrectNetwork]);

  // Prepare data for chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Total Supply',
        data: [2000000, 3500000, 5000000, 6800000, 8200000, 9500000, 10000000],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'transparent',
        tension: 0.4,
      },
      {
        label: 'Circulating Supply',
        data: [1000000, 2200000, 3800000, 4500000, 5000000, 5250000, 5250000],
        borderColor: theme.palette.secondary.main,
        backgroundColor: 'transparent',
        tension: 0.4,
      },
    ],
  };

  const handleMintDialogOpen = () => {
    setOpenMintDialog(true);
    setMintSuccess(false);
  };

  const handleMintDialogClose = () => {
    setOpenMintDialog(false);
    setMintAmount('');
    setMintAddress('');
    setReason('');
    setOrganization('');
    setMintSuccess(false);
    setError(null);
  };

  const handleBurnDialogOpen = () => {
    setOpenBurnDialog(true);
    setBurnSuccess(false);
  };

  const handleBurnDialogClose = () => {
    setOpenBurnDialog(false);
    setBurnAmount('');
    setReason('');
    setOrganization('');
  };

  const handleMint = async () => {
    if (!isInitialized) {
      await connectWallet();
      return;
    }
    
    if (!isCorrectNetwork) {
      await switchNetwork();
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    try {
      // Call the mint function from the Web3Context
      const tx = await mintTokens(mintAddress, mintAmount);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh data
      await refreshData();
      
      setMintSuccess(true);
      setTimeout(() => {
        handleMintDialogClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to mint tokens');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBurn = async () => {
    if (!isInitialized) {
      await connectWallet();
      return;
    }
    
    if (!isCorrectNetwork) {
      await switchNetwork();
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    try {
      // Call the burn function from the Web3Context
      const tx = await burnTokens(burnAmount);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh data
      await refreshData();
      
      setBurnSuccess(true);
      setTimeout(() => {
        handleBurnDialogClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to burn tokens');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Mint & Burn Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control the supply of TSHC stablecoin through minting and burning operations
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MintIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Total Minted
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {isLoading ? 'Loading...' : totalMinted.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Last minted: {mockMintBurnHistory.find(item => item.type === 'Mint')?.date}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BurnIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Total Burned
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {isLoading ? 'Loading...' : totalBurned.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Last burned: {mockMintBurnHistory.find(item => item.type === 'Burn')?.date}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReservesIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Net Circulating
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {isLoading ? 'Loading...' : netCirculating.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Backed by verified reserves at {collateralizationRatio}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Supply Chart */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 4
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          TSHC Supply History
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="medium">
          Mint & Burn History
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<HistoryIcon />} 
            variant="outlined"
          >
            View All History
          </Button>
          <Button 
            startIcon={<BurnIcon />} 
            variant="outlined" 
            color="error"
            onClick={handleBurnDialogOpen}
            disabled={!isInitialized || !isCorrectNetwork}
          >
            Burn TSHC
          </Button>
          <Button 
            startIcon={<AddIcon />} 
            variant="contained" 
            color="success"
            onClick={handleMintDialogOpen}
            disabled={!isInitialized || !isCorrectNetwork}
          >
            Mint TSHC
          </Button>
        </Box>
      </Box>

      {/* Mint/Burn History Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Authorized By</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Transaction Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading transaction history...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : mintBurnHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2">
                    No mint/burn transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : mintBurnHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">
                  {item.date}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.type} 
                    color={item.type === 'Mint' ? 'success' : 'error'} 
                    size="small" 
                    icon={item.type === 'Mint' ? <AddIcon /> : <RemoveIcon />}
                  />
                </TableCell>
                <TableCell align="right">{item.amount.toLocaleString()} TSHC</TableCell>
                <TableCell>{item.authorizedBy}</TableCell>
                <TableCell>{item.organization}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    <a 
                      href={`https://sepolia.basescan.org/address/${item.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}
                    >
                      {item.txHash.substring(0, 8)}...{item.txHash.substring(item.txHash.length - 6)}
                    </a>
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mint Dialog */}
      <Dialog open={openMintDialog} onClose={handleMintDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Mint TSHC Tokens</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {web3Error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {web3Error}
            </Alert>
          )}
          
          {mintSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully minted TSHC tokens! Transaction has been submitted to the blockchain.
            </Alert>
          ) : (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">
                Minting new TSHC tokens requires proper collateral backing in the reserve.
                Make sure sufficient reserves are available before proceeding.
              </Alert>
              <TextField 
                label="Recipient Address" 
                fullWidth 
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                margin="normal"
              />
              <TextField 
                label="Amount to Mint" 
                type="number" 
                fullWidth 
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">TSHC</Typography>,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select 
                  label="Organization" 
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  <MenuItem value="Bank of Tanzania">Bank of Tanzania</MenuItem>
                  <MenuItem value="NEDA Pay">NEDA Pay</MenuItem>
                  <MenuItem value="Ministry of Finance">Ministry of Finance</MenuItem>
                  <MenuItem value="ABSA Bank">ABSA Bank</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                label="Reason for Minting" 
                multiline 
                rows={3} 
                fullWidth 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                This operation will call the mint function on the TSHC smart contract.
                It requires multi-signature approval and will be recorded on the blockchain.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMintDialogClose}>Cancel</Button>
          {!mintSuccess && (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleMint}
              disabled={!mintAmount || !mintAddress || !reason || !organization || isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'Mint Tokens'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Burn Dialog */}
      <Dialog open={openBurnDialog} onClose={handleBurnDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Burn TSHC Tokens</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {web3Error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {web3Error}
            </Alert>
          )}
          
          {burnSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully burned TSHC tokens! Transaction has been submitted to the blockchain.
            </Alert>
          ) : (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="warning">
                Burning TSHC tokens permanently removes them from circulation.
                This action cannot be undone once confirmed.
              </Alert>
              <TextField 
                label="Amount to Burn" 
                type="number" 
                fullWidth 
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">TSHC</Typography>,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select 
                  label="Organization" 
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  <MenuItem value="Bank of Tanzania">Bank of Tanzania</MenuItem>
                  <MenuItem value="NEDA Pay">NEDA Pay</MenuItem>
                  <MenuItem value="Ministry of Finance">Ministry of Finance</MenuItem>
                  <MenuItem value="ABSA Bank">ABSA Bank</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                label="Reason for Burning" 
                multiline 
                rows={3} 
                fullWidth 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                This operation will call the burn function on the TSHC smart contract.
                It requires multi-signature approval and will be recorded on the blockchain.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBurnDialogClose}>Cancel</Button>
          {!burnSuccess && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleBurn}
              disabled={!burnAmount || !reason || !organization || isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'Burn Tokens'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MintBurn;
