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
  LinearProgress
} from '@mui/material';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReserveRatio: React.FC = () => {
  const { 
    totalSupply, 
    reserveRatio, 
    reserveBalance, 
    isLoading, 
    error, 
    refreshData 
  } = useBlockchain();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [reserveHistory, setReserveHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Reserve ratio data for doughnut chart
  const reserveData = {
    labels: ['Cash equivalents, Govt bonds and T-bills', 'Unbacked'],
    datasets: [
      {
        data: [reserveRatio, Math.max(0, 100 - reserveRatio)],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock historical reserve ratio data
  const [ratioHistory] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Reserve Ratio (%)',
        data: [100, 98.5, 99.2, 100, 99.8, reserveRatio],
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
    fetchReserveHistory();
  }, []);

  const fetchReserveHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      // In a real implementation, we would fetch actual reserve history from the blockchain
      // For demo purposes, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock reserve history
      const mockReserveHistory = [
        { 
          id: 1, 
          date: new Date(2025, 4, 14).toISOString(), 
          totalSupply: '20000.00', 
          reserveBalance: '21000.00', 
          ratio: 105.00 
        },
        { 
          id: 2, 
          date: new Date(2025, 4, 7).toISOString(), 
          totalSupply: '18000.00', 
          reserveBalance: '18500.00', 
          ratio: 102.78 
        },
        { 
          id: 3, 
          date: new Date(2025, 3, 30).toISOString(), 
          totalSupply: '15000.00', 
          reserveBalance: '15750.00', 
          ratio: 105.00 
        },
        { 
          id: 4, 
          date: new Date(2025, 3, 23).toISOString(), 
          totalSupply: '12000.00', 
          reserveBalance: '12600.00', 
          ratio: 105.00 
        },
        { 
          id: 5, 
          date: new Date(2025, 3, 16).toISOString(), 
          totalSupply: '8000.00', 
          reserveBalance: '8400.00', 
          ratio: 105.00 
        },
        { 
          id: 6, 
          date: new Date(2025, 3, 9).toISOString(), 
          totalSupply: '5000.00', 
          reserveBalance: '5250.00', 
          ratio: 105.00 
        }
      ];
      
      setReserveHistory(mockReserveHistory);
    } catch (err) {
      console.error('Error fetching reserve history:', err);
      setHistoryError('Failed to fetch reserve history. Please try again later.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
    fetchReserveHistory();
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

  const getRatioColor = (ratio: number) => {
    if (ratio >= 100) return 'success.main';
    if (ratio >= 95) return 'warning.main';
    return 'error.main';
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
          Reserve Ratio Monitoring
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
        {/* Current Reserve Status */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Reserve Status
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" color="text.secondary">
                    Total Supply:
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {formatCurrency(totalSupply)} TSHC
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    Reserve Balance:
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    TSH {formatCurrency(reserveBalance)}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    Current Reserve Ratio:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getRatioColor(reserveRatio)
                    }}
                  >
                    {reserveRatio.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Doughnut 
                      data={reserveData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Reserve Health:
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(reserveRatio, 100)} 
                  color={
                    reserveRatio >= 100 ? "success" : 
                    reserveRatio >= 95 ? "warning" : 
                    "error"
                  }
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    0%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    50%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    100%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Regulatory Requirements
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Minimum Required Ratio:
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  95.00%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Target Ratio:
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  100.00%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status:
                </Typography>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: reserveRatio >= 95 ? 'success.main' : 'error.main'
                  }}
                >
                  {reserveRatio >= 95 ? 'Compliant' : 'Non-Compliant'}
                </Typography>
              </Box>
              
              <Alert 
                severity={reserveRatio >= 100 ? "success" : reserveRatio >= 95 ? "warning" : "error"}
                sx={{ mt: 2 }}
              >
                {reserveRatio >= 100 
                  ? "The reserve is fully collateralized. All TSHC tokens are backed by TSH government bonds, T-bills, and cash equivalents."
                  : reserveRatio >= 95
                  ? "The reserve is within acceptable limits but not fully collateralized."
                  : "The reserve is below the minimum required ratio. Immediate action required."
                }
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Reserve Ratio History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reserve Ratio History (Last 6 Months)
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line 
                data={ratioHistory} 
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
                      min: 90,
                      max: 101,
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Reserve History Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reserve History
            </Typography>
            
            {isLoadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : historyError ? (
              <Alert severity="error">{historyError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Total Supply (TSHC)</TableCell>
                      <TableCell>Reserve Balance (TSH)</TableCell>
                      <TableCell>Reserve Ratio</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reserveHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{formatCurrency(item.totalSupply)}</TableCell>
                        <TableCell>TSH {formatCurrency(item.reserveBalance)}</TableCell>
                        <TableCell 
                          sx={{ 
                            color: getRatioColor(item.ratio),
                            fontWeight: 'bold'
                          }}
                        >
                          {item.ratio.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {item.ratio >= 95 ? (
                            <Typography variant="body2" color="success.main">
                              Compliant
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="error.main">
                              Non-Compliant
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {reserveHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No reserve history found</TableCell>
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
              The TSHC stablecoin is designed to maintain a 1:1 peg with the Tanzanian Shilling (TSH).
              To ensure stability and regulatory compliance, NEDA Pay maintains a diverse reserve of cash equivalents, 
              government bonds, and T-bills that backs the TSHC tokens in circulation.
            </Typography>
            <Typography variant="body1" paragraph>
              According to regulatory requirements, the reserve ratio must be maintained at a minimum of 95%,
              with a target of 100%. This means that for every TSHC token in circulation, at least 0.95 USDC
              must be held in the reserve contract.
            </Typography>
            <Typography variant="body1">
              The reserve is audited regularly, and any significant deviation from the target ratio
              requires immediate corrective action. Monthly reports are submitted to the Central Bank
              and other relevant regulatory authorities.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReserveRatio;
