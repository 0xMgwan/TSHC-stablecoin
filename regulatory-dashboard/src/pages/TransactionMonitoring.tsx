import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  txHash: string;
  type: 'transfer' | 'mint' | 'burn' | 'swap';
  status: 'success' | 'pending' | 'failed';
}

const TransactionMonitoring: React.FC = () => {
  const { isLoading: isBlockchainLoading, error: blockchainError } = useBlockchain();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(10);

  // Mock transaction volume data
  const [transactionVolume] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Transaction Count',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Transaction Volume (TSHC)',
        data: [28, 48, 40, 19, 86, 27, 90].map(x => x * 100),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, transactionType, dateRange, transactions]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would fetch actual transactions from the blockchain
      // For demo purposes, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock transactions
      const mockTransactions: Transaction[] = [];
      const types: ('transfer' | 'mint' | 'burn' | 'swap')[] = ['transfer', 'mint', 'burn', 'swap'];
      const statuses: ('success' | 'pending' | 'failed')[] = ['success', 'pending', 'failed'];
      
      // Generate 50 mock transactions
      for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 14)); // Random date within last 14 days
        
        mockTransactions.push({
          id: `tx-${i + 1}`,
          timestamp: date.toISOString(),
          from: i % 5 === 0 ? '0x0000000000000000000000000000000000000000' : `0x${Math.random().toString(16).substr(2, 40)}`,
          to: i % 8 === 0 ? '0x0000000000000000000000000000000000000000' : `0x${Math.random().toString(16).substr(2, 40)}`,
          amount: (Math.random() * 10000).toFixed(2),
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          type: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }
      
      // Sort by timestamp (newest first)
      mockTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setTransactions(mockTransactions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by transaction type
    if (transactionType !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }
    
    // Filter by date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }
    
    filtered = filtered.filter(tx => new Date(tx.timestamp) >= startDate);
    
    setFilteredTransactions(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionType(event.target.value);
  };

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return 'System';
    }
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'primary';
      case 'mint':
        return 'success';
      case 'burn':
        return 'error';
      case 'swap':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Calculate pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredTransactions.length / rowsPerPage);

  if (isBlockchainLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction Monitoring
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh Data
          </Button>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {(blockchainError || error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {blockchainError || error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Transaction Volume Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Activity (Last 7 Days)
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar 
                data={transactionVolume} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Transaction Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {transactions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All transactions in selected period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mint Operations
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {transactions.filter(tx => tx.type === 'mint').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New TSHC tokens created
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Burn Operations
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {transactions.filter(tx => tx.type === 'burn').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TSHC tokens removed from circulation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failed Transactions
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2, color: 'error.main' }}>
                {transactions.filter(tx => tx.status === 'failed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transactions that failed to execute
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ flexGrow: 1, minWidth: '200px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by address or tx hash"
              />
              
              <TextField
                select
                label="Transaction Type"
                variant="outlined"
                size="small"
                value={transactionType}
                onChange={handleTypeChange}
                sx={{ minWidth: '150px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="mint">Mint</MenuItem>
                <MenuItem value="burn">Burn</MenuItem>
                <MenuItem value="swap">Swap</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Time Period"
                variant="outlined"
                size="small"
                value={dateRange}
                onChange={handleDateRangeChange}
                sx={{ minWidth: '150px' }}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </TextField>
            </Box>
          </Paper>
        </Grid>

        {/* Transaction Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction List
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Amount (TSHC)</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Transaction Hash</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} 
                              color={getTypeColor(tx.type) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatAddress(tx.from)}</TableCell>
                          <TableCell>{formatAddress(tx.to)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {tx.type === 'mint' && <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />}
                              {tx.type === 'burn' && <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />}
                              {formatAmount(tx.amount)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} 
                              color={getStatusColor(tx.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {tx.txHash.substring(0, 10)}...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No transactions found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {Math.min(filteredTransactions.length, startIndex + 1)}-{Math.min(filteredTransactions.length, endIndex)} of {filteredTransactions.length} transactions
                  </Typography>
                  <Pagination 
                    count={pageCount} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Regulatory Notes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Regulatory Notes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              All TSHC transactions are recorded on the Base blockchain and can be monitored in real-time.
              Regulatory authorities have access to this dashboard to track token movements, mint/burn operations,
              and ensure compliance with anti-money laundering (AML) and know-your-customer (KYC) regulations.
            </Typography>
            <Typography variant="body1" paragraph>
              Large transactions (over 10,000 TSHC) are automatically flagged for review, and suspicious
              transaction patterns are reported to the appropriate authorities as required by law.
            </Typography>
            <Typography variant="body1">
              Monthly transaction reports are generated and submitted to the Central Bank and
              other relevant regulatory bodies to maintain transparency and compliance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionMonitoring;
