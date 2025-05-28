import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme
} from '@mui/material';
import web3Service from '../services/web3Service';

// ABI for role management functions
const roleManagementAbi = [
  "function grantRole(bytes32 role, address account) public",
  "function revokeRole(bytes32 role, address account) public",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
  "function MINTER_ROLE() public view returns (bytes32)",
  "function ADMIN_ROLE() public view returns (bytes32)"
];

// Mock data for current minters
const mockMinters = [
  { address: '0x4c7455eb3f73f761A2394699EA156196D8a0449D', dateAdded: '2025-04-01', addedBy: 'Admin' }
];

const RoleManagement: React.FC = () => {
  const theme = useTheme();
  const { 
    isInitialized, 
    isCorrectNetwork, 
    account, 
    connectWallet,
    switchNetwork,
    refreshData,
    error: web3Error
  } = useWeb3();
  
  const [newMinterAddress, setNewMinterAddress] = useState('');
  const [addressToRevoke, setAddressToRevoke] = useState('');
  const [minters, setMinters] = useState<{address: string, dateAdded: string, addedBy: string}[]>(mockMinters);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [minterRole, setMinterRole] = useState('');

  useEffect(() => {
    // Get contract address from environment or context
    const tshcAddress = process.env.REACT_APP_TSHC_CONTRACT_ADDRESS || '0x0859D42FD008D617c087DD386667da51570B1aAB';
    setContractAddress(tshcAddress);
    
    // Get the MINTER_ROLE bytes32 value
    if (isInitialized) {
      web3Service.getMinterRole()
        .then((role: string) => {
          setMinterRole(role);
        })
        .catch((err: any) => {
          console.error('Error getting MINTER_ROLE:', err);
        });
    }
  }, [isInitialized]);

  // Function to grant MINTER_ROLE to a new address
  const grantMinterRole = async () => {
    if (!newMinterAddress || !/^0x[a-fA-F0-9]{40}$/.test(newMinterAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }
      
      // Check if address already has the role
      const hasRole = await web3Service.hasRole(minterRole, newMinterAddress);
      if (hasRole) {
        setSuccess(`Address ${newMinterAddress} already has MINTER_ROLE`);
        setIsProcessing(false);
        return;
      }

      // Grant the role
      const tx = await web3Service.grantRole(minterRole, newMinterAddress);
      await tx.wait();
      
      // Update the minters list
      const newMinter = {
        address: newMinterAddress,
        dateAdded: new Date().toISOString().split('T')[0],
        addedBy: account
      };
      setMinters([...minters, newMinter]);
      
      setSuccess(`Successfully granted MINTER_ROLE to ${newMinterAddress}`);
      setNewMinterAddress('');
    } catch (err: any) {
      console.error('Error granting role:', err);
      setError(err.message || 'Error granting MINTER_ROLE');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to revoke MINTER_ROLE from an address
  const revokeMinterRole = async () => {
    if (!addressToRevoke || !/^0x[a-fA-F0-9]{40}$/.test(addressToRevoke)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }
      
      // Check if address has the role
      const hasRole = await web3Service.hasRole(minterRole, addressToRevoke);
      if (!hasRole) {
        setSuccess(`Address ${addressToRevoke} does not have MINTER_ROLE`);
        setIsProcessing(false);
        return;
      }

      // Revoke the role
      const tx = await web3Service.revokeRole(minterRole, addressToRevoke);
      await tx.wait();
      
      // Update the minters list
      setMinters(minters.filter(m => m.address.toLowerCase() !== addressToRevoke.toLowerCase()));
      
      setSuccess(`Successfully revoked MINTER_ROLE from ${addressToRevoke}`);
      setAddressToRevoke('');
    } catch (err: any) {
      console.error('Error revoking role:', err);
      setError(err.message || 'Error revoking MINTER_ROLE');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to check if an address has MINTER_ROLE
  const checkMinterRole = async (address: string) => {
    if (!isInitialized) return false;
    
    try {
      return await web3Service.hasRole(minterRole, address);
    } catch (err) {
      console.error('Error checking role:', err);
      return false;
    }
  };

  if (!isInitialized) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Connect Wallet</Typography>
        <Typography variant="body1" gutterBottom>
          Please connect your wallet to manage TSHC minter roles
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={connectWallet}
          sx={{ mt: 2 }}
        >
          Connect Wallet
        </Button>
      </Box>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Wrong Network</Typography>
        <Typography variant="body1" gutterBottom>
          Please switch to the Base network to manage TSHC minter roles
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={switchNetwork}
          sx={{ mt: 2 }}
        >
          Switch Network
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>TSHC Role Management</Typography>
      
      {web3Error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {web3Error}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Grant MINTER_ROLE section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Grant MINTER_ROLE</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Add a new address that can mint and burn TSHC tokens
            </Typography>
            
            <TextField
              label="Wallet Address"
              fullWidth
              value={newMinterAddress}
              onChange={(e) => setNewMinterAddress(e.target.value)}
              margin="normal"
              placeholder="0x..."
              helperText="Enter the Ethereum address to grant minting permissions"
            />
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={grantMinterRole}
              disabled={isProcessing || !newMinterAddress}
              sx={{ mt: 2 }}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'Grant MINTER_ROLE'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Revoke MINTER_ROLE section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Revoke MINTER_ROLE</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Remove an address from the list of authorized minters
            </Typography>
            
            <TextField
              label="Wallet Address"
              fullWidth
              value={addressToRevoke}
              onChange={(e) => setAddressToRevoke(e.target.value)}
              margin="normal"
              placeholder="0x..."
              helperText="Enter the Ethereum address to revoke minting permissions"
            />
            
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={revokeMinterRole}
              disabled={isProcessing || !addressToRevoke}
              sx={{ mt: 2 }}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'Revoke MINTER_ROLE'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Current minters table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Current Authorized Minters</Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Date Added</TableCell>
                    <TableCell>Added By</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {minters.map((minter, index) => (
                    <TableRow key={index}>
                      <TableCell>{minter.address}</TableCell>
                      <TableCell>{minter.dateAdded}</TableCell>
                      <TableCell>{minter.addedBy}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Active" 
                          color="success" 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleManagement;
