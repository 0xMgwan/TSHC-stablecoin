import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  useTheme as useMuiTheme
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import {
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title
);

const Dashboard: React.FC = () => {
  const { 
    totalSupply, 
    circulatingSupply, 
    reserveRatio, 
    reserveBalance, 
    isLoading, 
    error, 
    refreshData 
  } = useBlockchain();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Mock data for transaction volume over time
  const [transactionData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Transaction Volume (TSHC)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

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

  useEffect(() => {
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      refreshData();
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  const handleRefresh = () => {
    refreshData();
    setLastUpdated(new Date());
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: mode === 'dark' ? '#fff' : '#666'
        }
      },
      title: {
        display: true,
        text: 'Transaction Volume (Last 7 Days)',
        color: mode === 'dark' ? '#fff' : '#666'
      },
    },
    scales: {
      x: {
        grid: {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: mode === 'dark' ? '#fff' : '#666'
        }
      },
      y: {
        grid: {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: mode === 'dark' ? '#fff' : '#666'
        }
      }
    }
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
          Regulatory Overview
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
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light', color: mode === 'dark' ? 'white' : 'black' }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.name}
            </Typography>
            <Typography variant="body1">
              This dashboard provides regulatory oversight for TSHC stablecoin on Base network.
              As a {user?.role.replace('_', ' ')}, you have access to monitor token supply, reserve ratio,
              and transaction activity.
            </Typography>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Supply
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {formatCurrency(totalSupply)} TSHC
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total TSHC tokens in circulation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Reserve Balance
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                TSH {formatCurrency(reserveBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cash equivalents, Govt bonds and T-bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Reserve Ratio
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  my: 2,
                  color: reserveRatio >= 100 ? 'success.main' : reserveRatio >= 90 ? 'warning.main' : 'error.main'
                }}
              >
                {reserveRatio.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Percentage of TSHC backed by USDC
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Users
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                1,245
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users with TSHC transactions in last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Transaction Volume (Last 6 Months)
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={transactionData} 
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Reserve Ratio
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate('/token-supply')}
                >
                  View Token Supply Details
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate('/reserve-ratio')}
                >
                  Monitor Reserve Ratio
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate('/transactions')}
                >
                  Track Transactions
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate('/compliance')}
                >
                  Generate Compliance Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
