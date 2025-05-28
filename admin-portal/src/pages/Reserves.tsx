import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Info as InfoIcon,
  AccountBalance as ReservesIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';

// Mock data for reserves
const mockReserveAssets = [
  { 
    id: 1, 
    type: 'Cash Equivalents at Bank', 
    amount: 1000000, 
    percentage: 100, 
    lastVerified: '2025-04-16', 
    status: 'Verified', 
    issuer: 'NEDA Pay', 
    maturityDate: 'N/A',
    address: '0x4ecD2810a6A412fdc95B71c03767068C35D23fE3'
  },
  { 
    id: 2, 
    type: 'Government Bonds', 
    amount: 0, 
    percentage: 0, 
    lastVerified: '2025-04-01', 
    status: 'Pending', 
    issuer: 'Bank of Tanzania', 
    maturityDate: '2026-04-01' 
  },
  { 
    id: 3, 
    type: 'T-Bills', 
    amount: 0, 
    percentage: 0, 
    lastVerified: '2025-04-02', 
    status: 'Pending', 
    issuer: 'Ministry of Finance', 
    maturityDate: '2025-10-01' 
  },
];

// Mock data for reserve transactions
const mockReserveTransactions = [
  { 
    id: 1, 
    date: '2025-04-16', 
    type: 'Deposit', 
    assetType: 'Cash Equivalents at Bank', 
    amount: 1000000, 
    verifiedBy: 'Admin', 
    organization: 'NEDA Pay',
    txHash: '0x4ecD2810a6A412fdc95B71c03767068C35D23fE3'
  },
  { 
    id: 2, 
    date: '2025-04-16', 
    type: 'Mint', 
    assetType: 'TSHC', 
    amount: 100000, 
    verifiedBy: 'Admin', 
    organization: 'NEDA Pay',
    txHash: '0x0859D42FD008D617c087DD386667da51570B1aAB'
  },
  { 
    id: 3, 
    date: '2025-04-16', 
    type: 'Burn', 
    assetType: 'TSHC', 
    amount: 50000, 
    verifiedBy: 'Admin', 
    organization: 'NEDA Pay',
    txHash: '0x0859D42FD008D617c087DD386667da51570B1aAB'
  }
];

const Reserves: React.FC = () => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');

  // Calculate total reserves
  const totalReserves = mockReserveAssets.reduce((sum, asset) => sum + asset.amount, 0);
  
  // Prepare data for chart
  const reserveData = {
    labels: mockReserveAssets.map(asset => asset.type),
    datasets: [
      {
        data: mockReserveAssets.map(asset => asset.percentage),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
  };

  const handleEditDialogOpen = (asset: any) => {
    setSelectedAsset(asset);
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setSelectedAsset(null);
    setOpenEditDialog(false);
  };

  const handleAddAsset = () => {
    // Logic to add new asset would go here
    handleAddDialogClose();
  };

  const handleEditAsset = () => {
    // Logic to edit asset would go here
    handleEditDialogClose();
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Reserve Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage the collateral backing the TSHC stablecoin
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
                <ReservesIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Total Reserves
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {totalReserves.toLocaleString()} TSH
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<VerifiedIcon />} 
                  label="Fully Verified" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Last audit: April 5, 2025
                </Typography>
              </Box>
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
                <Typography variant="h6" fontWeight="medium">
                  Backing Ratio
                </Typography>
                <Tooltip title="The ratio of reserve assets to TSHC in circulation">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  102.5%
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                  +0.5% from target
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress to 105% target
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(102.5 / 105) * 100} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Reserve Allocation
              </Typography>
              <Box sx={{ height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut 
                  data={reserveData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant={activeTab === 'assets' ? 'contained' : 'outlined'} 
            onClick={() => setActiveTab('assets')}
          >
            Reserve Assets
          </Button>
          <Button 
            variant={activeTab === 'transactions' ? 'contained' : 'outlined'} 
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<RefreshIcon />} 
            variant="outlined"
          >
            Refresh
          </Button>
          <Button 
            startIcon={<ExportIcon />} 
            variant="outlined"
          >
            Export
          </Button>
          {activeTab === 'assets' && (
            <Button 
              startIcon={<AddIcon />} 
              variant="contained" 
              onClick={handleAddDialogOpen}
            >
              Add Asset
            </Button>
          )}
        </Box>
      </Box>

      {/* Reserve Assets Table */}
      {activeTab === 'assets' && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset Type</TableCell>
                <TableCell align="right">Amount (TSH)</TableCell>
                <TableCell align="right">Percentage</TableCell>
                <TableCell>Issuer</TableCell>
                <TableCell>Maturity Date</TableCell>
                <TableCell>Last Verified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReserveAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell component="th" scope="row">
                    {asset.type}
                  </TableCell>
                  <TableCell align="right">{asset.amount.toLocaleString()}</TableCell>
                  <TableCell align="right">{asset.percentage}%</TableCell>
                  <TableCell>{asset.issuer}</TableCell>
                  <TableCell>{asset.maturityDate}</TableCell>
                  <TableCell>{asset.lastVerified}</TableCell>
                  <TableCell>
                    <Chip 
                      label={asset.status} 
                      color={asset.status === 'Verified' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditDialogOpen(asset)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reserve Transactions Table */}
      {activeTab === 'transactions' && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell align="right">Amount (TSH)</TableCell>
                <TableCell>Verified By</TableCell>
                <TableCell>Organization</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReserveTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell component="th" scope="row">
                    {transaction.date}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type} 
                      color={transaction.type === 'Deposit' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{transaction.assetType}</TableCell>
                  <TableCell align="right">{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell>{transaction.verifiedBy}</TableCell>
                  <TableCell>{transaction.organization}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Asset Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Reserve Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Asset Type</InputLabel>
              <Select label="Asset Type" defaultValue="">
                <MenuItem value="Government Bonds">Government Bonds</MenuItem>
                <MenuItem value="T-Bills">T-Bills</MenuItem>
                <MenuItem value="Cash Equivalents">Cash Equivalents</MenuItem>
                <MenuItem value="Corporate Bonds">Corporate Bonds</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Amount (TSH)" type="number" fullWidth />
            <TextField label="Issuer" fullWidth />
            <TextField label="Maturity Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Description" multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAsset}>Add Asset</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Reserve Asset</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select label="Asset Type" defaultValue={selectedAsset.type}>
                  <MenuItem value="Government Bonds">Government Bonds</MenuItem>
                  <MenuItem value="T-Bills">T-Bills</MenuItem>
                  <MenuItem value="Cash Equivalents">Cash Equivalents</MenuItem>
                  <MenuItem value="Corporate Bonds">Corporate Bonds</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Amount (TSH)" type="number" defaultValue={selectedAsset.amount} fullWidth />
              <TextField label="Issuer" defaultValue={selectedAsset.issuer} fullWidth />
              <TextField 
                label="Maturity Date" 
                type="date" 
                defaultValue={selectedAsset.maturityDate !== 'N/A' ? selectedAsset.maturityDate : ''} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue={selectedAsset.status}>
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Pending">Pending Verification</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditAsset}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reserves;
