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
  Divider
} from '@mui/material';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TokenSupply: React.FC = () => {
  const { 
    tshcContract, 
    totalSupply, 
    circulatingSupply, 
    isLoading, 
    error, 
    refreshData 
  } = useBlockchain();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mintEvents, setMintEvents] = useState<any[]>([]);
  const [burnEvents, setBurnEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Mock historical supply data
  const [supplyHistory] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Supply (TSHC)',
        data: [5000, 8000, 12000, 15000, 18000, parseFloat(totalSupply)],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ],
  });

  useEffect(() => {
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      refreshData();
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  useEffect(() => {
    fetchTokenEvents();
  }, [tshcContract]);

  const fetchTokenEvents = async () => {
    if (!tshcContract) return;

    setIsLoadingEvents(true);
    setEventError(null);

    try {
      // In a real implementation, we would fetch actual events from the blockchain
      // For demo purposes, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock mint events
      const mockMintEvents = [
        { 
          id: 1, 
          timestamp: new Date(2025, 4, 10).toISOString(), 
          amount: '5000.00', 
          minter: '0x1234...5678', 
          txHash: '0xabcd...1234' 
        },
        { 
          id: 2, 
          timestamp: new Date(2025, 4, 8).toISOString(), 
          amount: '3000.00', 
          minter: '0x5678...9abc', 
          txHash: '0xdef0...5678' 
        },
        { 
          id: 3, 
          timestamp: new Date(2025, 4, 5).toISOString(), 
          amount: '2000.00', 
          minter: '0x9abc...def0', 
          txHash: '0x9012...3456' 
        },
        { 
          id: 4, 
          timestamp: new Date(2025, 4, 1).toISOString(), 
          amount: '10000.00', 
          minter: '0xdef0...1234', 
          txHash: '0x7890...abcd' 
        }
      ];
      
      // Mock burn events
      const mockBurnEvents = [
        { 
          id: 1, 
          timestamp: new Date(2025, 4, 9).toISOString(), 
          amount: '1000.00', 
          burner: '0x2345...6789', 
          txHash: '0xbcde...2345' 
        },
        { 
          id: 2, 
          timestamp: new Date(2025, 4, 3).toISOString(), 
          amount: '500.00', 
          burner: '0x6789...abcd', 
          txHash: '0xef01...6789' 
        }
      ];
      
      setMintEvents(mockMintEvents);
      setBurnEvents(mockBurnEvents);
    } catch (err) {
      console.error('Error fetching token events:', err);
      setEventError('Failed to fetch token events. Please try again later.');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
    fetchTokenEvents();
    setLastUpdated(new Date());
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address: string) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  if (isLoading) {
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
          Token Supply Monitoring
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Supply
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {formatCurrency(totalSupply)} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total amount of TSHC tokens that have been minted
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Circulating Supply
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {formatCurrency(circulatingSupply)} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TSHC tokens currently in circulation (excluding any locked tokens)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Supply History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Supply History (Last 6 Months)
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line 
                data={supplyHistory} 
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

        {/* Mint Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Mint Events
            </Typography>
            
            {isLoadingEvents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : eventError ? (
              <Alert severity="error">{eventError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Minter</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mintEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{formatDate(event.timestamp)}</TableCell>
                        <TableCell>{formatCurrency(event.amount)} TSHC</TableCell>
                        <TableCell>{formatAddress(event.minter)}</TableCell>
                      </TableRow>
                    ))}
                    {mintEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No mint events found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Burn Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Burn Events
            </Typography>
            
            {isLoadingEvents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : eventError ? (
              <Alert severity="error">{eventError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Burner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {burnEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{formatDate(event.timestamp)}</TableCell>
                        <TableCell>{formatCurrency(event.amount)} TSHC</TableCell>
                        <TableCell>{formatAddress(event.burner)}</TableCell>
                      </TableRow>
                    ))}
                    {burnEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No burn events found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
              The TSHC token supply is managed through a controlled minting and burning process. 
              New tokens are minted when users deposit TSH (Tanzanian Shillings) to NEDA Pay's account, 
              and tokens are burned when users withdraw TSH.
            </Typography>
            <Typography variant="body1" paragraph>
              All minting and burning operations are recorded on the Base blockchain and can be 
              audited by regulatory authorities. The total supply should always be backed by an 
              equivalent amount of USDC in the reserve contract.
            </Typography>
            <Typography variant="body1">
              Any significant changes in token supply are monitored and require appropriate 
              documentation to ensure compliance with financial regulations.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenSupply;
