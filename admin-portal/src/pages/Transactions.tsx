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
  TextField,
  InputAdornment,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  SwapHoriz as SwapIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

// Mock data for transactions
const mockTransactions = [
  { 
    id: 1, 
    type: 'Transfer', 
    amount: 5000, 
    from: '0x1a2b3c...', 
    to: '0x4d5e6f...', 
    date: '2025-04-07 14:32:15', 
    status: 'Confirmed',
    txHash: '0x1a2b3c4d5e6f...',
    blockNumber: 12345678
  },
  { 
    id: 2, 
    type: 'Deposit', 
    amount: 10000, 
    from: 'Bank of Tanzania', 
    to: '0x7g8h9i...', 
    date: '2025-04-07 12:15:30', 
    status: 'Confirmed',
    txHash: '0x2b3c4d5e6f7g...',
    blockNumber: 12345670
  },
  { 
    id: 3, 
    type: 'Withdrawal', 
    amount: 3000, 
    from: '0x9i0j1k...', 
    to: 'CRDB Bank', 
    date: '2025-04-06 18:45:22', 
    status: 'Confirmed',
    txHash: '0x3c4d5e6f7g8h...',
    blockNumber: 12345665
  },
  { 
    id: 4, 
    type: 'Transfer', 
    amount: 2500, 
    from: '0x2b3c4d...', 
    to: '0x5e6f7g...', 
    date: '2025-04-06 15:20:11', 
    status: 'Confirmed',
    txHash: '0x4d5e6f7g8h9i...',
    blockNumber: 12345660
  },
  { 
    id: 5, 
    type: 'Deposit', 
    amount: 8000, 
    from: 'NMB Bank', 
    to: '0x8h9i0j...', 
    date: '2025-04-06 09:10:45', 
    status: 'Confirmed',
    txHash: '0x5e6f7g8h9i0j...',
    blockNumber: 12345655
  },
  { 
    id: 6, 
    type: 'Transfer', 
    amount: 1200, 
    from: '0x3c4d5e...', 
    to: '0x6f7g8h...', 
    date: '2025-04-05 22:05:33', 
    status: 'Confirmed',
    txHash: '0x6f7g8h9i0j1k...',
    blockNumber: 12345650
  },
  { 
    id: 7, 
    type: 'Withdrawal', 
    amount: 4500, 
    from: '0x4d5e6f...', 
    to: 'Exim Bank', 
    date: '2025-04-05 16:30:18', 
    status: 'Confirmed',
    txHash: '0x7g8h9i0j1k2l...',
    blockNumber: 12345645
  },
  { 
    id: 8, 
    type: 'Transfer', 
    amount: 3300, 
    from: '0x5e6f7g...', 
    to: '0x8h9i0j...', 
    date: '2025-04-05 11:25:09', 
    status: 'Confirmed',
    txHash: '0x8h9i0j1k2l3m...',
    blockNumber: 12345640
  },
  { 
    id: 9, 
    type: 'Deposit', 
    amount: 7500, 
    from: 'Stanbic Bank', 
    to: '0x9i0j1k...', 
    date: '2025-04-04 19:40:27', 
    status: 'Confirmed',
    txHash: '0x9i0j1k2l3m4n...',
    blockNumber: 12345635
  },
  { 
    id: 10, 
    type: 'Transfer', 
    amount: 6200, 
    from: '0x6f7g8h...', 
    to: '0x9i0j1k...', 
    date: '2025-04-04 14:15:52', 
    status: 'Confirmed',
    txHash: '0x0j1k2l3m4n5o...',
    blockNumber: 12345630
  },
];

const Transactions: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate transaction stats
  const totalVolume = mockTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const deposits = mockTransactions.filter(tx => tx.type === 'Deposit');
  const withdrawals = mockTransactions.filter(tx => tx.type === 'Withdrawal');
  const transfers = mockTransactions.filter(tx => tx.type === 'Transfer');
  
  const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransfers = transfers.reduce((sum, tx) => sum + tx.amount, 0);

  // Prepare data for chart
  const chartData = {
    labels: ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7'],
    datasets: [
      {
        label: 'Transaction Volume',
        data: [15000, 22000, 18000, 25000, 30000, 28000, 35000],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main + '20',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Filter transactions based on search term
  const filteredTransactions = mockTransactions.filter(tx => 
    tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Transfer': return <SwapIcon />;
      case 'Deposit': return <ArrowDownIcon />;
      case 'Withdrawal': return <ArrowUpIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Transfer': return 'primary';
      case 'Deposit': return 'success';
      case 'Withdrawal': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Transaction Monitoring
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and analyze all TSHC transactions across the network
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Total Volume
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalVolume.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across {mockTransactions.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom color="success.main">
                Deposits
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {totalDeposits.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {deposits.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom color="warning.main">
                Withdrawals
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {totalWithdrawals.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {withdrawals.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom color="primary.main">
                Transfers
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {totalTransfers.toLocaleString()} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {transfers.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Volume Chart */}
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
          Transaction Volume (Last 7 Days)
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
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

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '50%' }}>
          <TextField
            placeholder="Search by address or transaction hash..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
        </Box>
        <Box>
          <Button 
            startIcon={<FilterIcon />} 
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Filters
          </Button>
          <Button variant="contained">
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction Hash</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {tx.txHash}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tx.type} 
                    color={getTypeColor(tx.type)} 
                    size="small" 
                    icon={getTypeIcon(tx.type)}
                  />
                </TableCell>
                <TableCell align="right">{tx.amount.toLocaleString()} TSHC</TableCell>
                <TableCell>
                  <Tooltip title={tx.from}>
                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.from}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={tx.to}>
                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.to}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={tx.status} 
                    color={tx.status === 'Confirmed' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Transactions;
