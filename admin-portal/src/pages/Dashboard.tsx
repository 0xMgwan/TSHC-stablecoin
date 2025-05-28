import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as ReservesIcon,
  Receipt as TransactionsIcon,
  VerifiedUser as KycIcon,
  MonetizationOn as MintIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  ChartTooltip, 
  Legend,
  ArcElement,
  BarElement
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    isInitialized, 
    isCorrectNetwork, 
    account, 
    totalSupply, 
    collateralizationRatio,
    userBalance,
    connectWallet,
    refreshData
  } = useWeb3();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch blockchain data when component mounts
  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (isInitialized && isCorrectNetwork) {
        setIsLoading(true);
        try {
          await refreshData();
        } catch (error) {
          console.error('Error fetching blockchain data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchBlockchainData();
  }, [isInitialized, isCorrectNetwork, refreshData]);

  // Mock data for charts
  const reserveData = {
    labels: ['Government Bonds', 'T-Bills', 'Cash Equivalents'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  const transactionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Transaction Volume (TSHC)',
        data: [3200000, 4100000, 3800000, 5200000, 4800000, 5500000, 6200000],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '40',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const kycData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'KYC Status',
        data: [12, 84, 4],
        backgroundColor: [
          theme.palette.warning.main,
          theme.palette.success.main,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const mintBurnData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Minted',
        data: [1200000, 1500000, 1300000, 1800000, 1600000, 2000000, 2200000],
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Burned',
        data: [800000, 900000, 1000000, 1200000, 1100000, 1300000, 1500000],
        backgroundColor: theme.palette.error.main,
      },
    ],
  };

  // Recent activity mock data
  const recentActivity = [
    { 
      type: 'mint', 
      amount: '1,000,000 TSHC', 
      organization: 'Bank of Tanzania', 
      time: '2 hours ago',
      icon: <MintIcon color="success" />
    },
    { 
      type: 'kyc', 
      entity: 'CRDB Bank', 
      status: 'Approved', 
      time: '5 hours ago',
      icon: <KycIcon color="info" />
    },
    { 
      type: 'transaction', 
      amount: '500,000 TSHC', 
      from: 'Reserve', 
      to: 'Distribution', 
      time: '1 day ago',
      icon: <TransactionsIcon color="primary" />
    },
    { 
      type: 'reserve', 
      action: 'Added', 
      asset: 'Government Bonds', 
      amount: '2,000,000 TSH', 
      time: '2 days ago',
      icon: <ReservesIcon color="secondary" />
    },
  ];

  // Summary stats with real data from blockchain when available
  const summaryStats = [
    { 
      title: 'Total Supply', 
      value: isInitialized && isCorrectNetwork ? 
        `${parseFloat(totalSupply).toLocaleString()} TSHC` : 
        '-- TSHC', 
      change: '+5.2%', 
      trend: 'up' 
    },
    { 
      title: 'Circulating Supply', 
      value: isInitialized && isCorrectNetwork ? 
        `${parseFloat(totalSupply).toLocaleString()} TSHC` : 
        '-- TSHC', 
      change: '+3.8%', 
      trend: 'up' 
    },
    { 
      title: 'Backing Ratio', 
      value: isInitialized && isCorrectNetwork ? 
        `${collateralizationRatio}%` : 
        '--%', 
      change: '+0.5%', 
      trend: 'up' 
    },
    { 
      title: 'Token Holders', 
      value: '1,245', 
      change: '+12.3%', 
      trend: 'up' 
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of the TSHC stablecoin ecosystem and operations
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Your TSHC Balance
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {isInitialized && isCorrectNetwork && account ? 
                  `${parseFloat(userBalance).toLocaleString()} TSHC` : 
                  '-- TSHC'}
              </Typography>
              {!account && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  onClick={connectWallet}
                  sx={{ mt: 1 }}
                >
                  Connect Wallet
                </Button>
              )}
              {account && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </Typography>
              )}
            </Box>
            <Box 
              sx={{ 
                position: 'absolute', 
                right: -20, 
                bottom: -20, 
                opacity: 0.1,
                transform: 'rotate(-10deg)'
              }}
            >
              <MintIcon sx={{ fontSize: 100 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Total Supply
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {isInitialized && isCorrectNetwork ? 
                  `${parseFloat(totalSupply).toLocaleString()} TSHC` : 
                  '-- TSHC'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon 
                  color="success" 
                  fontSize="small" 
                  sx={{ mr: 0.5 }} 
                />
                <Typography 
                  variant="body2" 
                  color="success.main"
                  fontWeight="medium"
                >
                  +5.2%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  since last month
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold">
                {isLoading ? 'Loading...' : stat.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {stat.trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography 
                  variant="body2" 
                  color={stat.trend === 'up' ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {stat.change}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  since last month
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Dashboard Content */}
      {!isInitialized && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Connect your wallet to see real-time blockchain data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You need to connect your wallet to view the current state of the TSHC smart contracts
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {/* Transaction Volume Chart */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                Transaction Volume
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line 
                data={transactionData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
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
        </Grid>

        {/* Reserve Allocation */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                Reserve Allocation
              </Typography>
              <Tooltip title="Collateral backing the TSHC stablecoin">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
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
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="success.main" fontWeight="medium">
                Fully Backed (102.5%)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All TSHC tokens are backed by verified reserve assets
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Mint & Burn Activity */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                Mint & Burn Activity
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate('/mint-burn')}
              >
                View Details
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={mintBurnData} 
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
        </Grid>

        {/* KYC Status */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                KYC Status
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate('/kyc')}
              >
                Manage KYC
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 200 }}>
                  <Doughnut 
                    data={kycData} 
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
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    KYC Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Entities</Typography>
                    <Typography variant="body2" fontWeight="medium">100</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">84</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">12</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Rejected</Typography>
                    <Typography variant="body2" fontWeight="medium" color="error.main">4</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" component="span">
                          {activity.type === 'mint' && `${activity.amount} minted by ${activity.organization}`}
                          {activity.type === 'kyc' && `KYC for ${activity.entity} was ${activity.status}`}
                          {activity.type === 'transaction' && `${activity.amount} transferred from ${activity.from} to ${activity.to}`}
                          {activity.type === 'reserve' && `${activity.action} ${activity.amount} in ${activity.asset}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" component="span">
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button color="primary">View All Activity</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
