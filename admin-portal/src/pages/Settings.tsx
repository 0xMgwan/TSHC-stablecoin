import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Tooltip,
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  Key as KeyIcon,
  Code as CodeIcon,
  Description as DocumentationIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../contexts/Web3Context';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [value, setValue] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  const { user } = useAuth();
  const { account } = useWeb3();

  // Mock API keys
  const [apiKeys, setApiKeys] = useState({
    liveKey: 'sk_live_51NxYz2CZ6qKUzXjE2WdH8TvMnFJk3L7mR9pQs5oTg6bVcXwZ1yA',
    testKey: 'sk_test_51NxYz2CZ6qKUzXjE2WdH8TvMnFJk3L7mR9pQs5oTg6bVcXwZ1yA'
  });

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOrganization(user.organization || '');
      // You could load profile image here if available
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Here you would save the profile data to your backend
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSnackbar({
      open: true,
      message: 'API key copied to clipboard',
      severity: 'success'
    });
  };

  const handleRegenerateApiKey = (type: 'live' | 'test') => {
    // Here you would call your API to regenerate the key
    // For now, we'll just simulate it
    const newKey = type === 'live' 
      ? 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      : 'sk_test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    setApiKeys(prev => ({
      ...prev,
      [type === 'live' ? 'liveKey' : 'testKey']: newKey
    }));
    
    setSnackbar({
      open: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} API key regenerated`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" icon={<Avatar sx={{ width: 24, height: 24 }} />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="API Keys" icon={<KeyIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Developer" icon={<CodeIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Documentation" icon={<DocumentationIcon />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>
        
        {/* Profile Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profileImage || undefined}
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {!profileImage && name.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleProfileImageChange}
              />
              <label htmlFor="profile-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Change Photo
                </Button>
              </label>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Connected Wallet
                </Typography>
                <TextField
                  fullWidth
                  label="Ethereum Address"
                  value={account || 'No wallet connected'}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />
                <Alert severity="info">
                  This is the Ethereum address that will be used for signing transactions.
                </Alert>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                sx={{ mt: 3 }}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* API Keys Tab */}
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            API Keys
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use these API keys to authenticate requests with the NEDA Pay API. Keep your API keys secure and do not share them in public areas such as GitHub or client-side code.
          </Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Live API Key
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use for production environment
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleRegenerateApiKey('live')}
                >
                  Regenerate
                </Button>
              </Box>
              
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  value={apiKeys.liveKey}
                  type={showLiveKey ? 'text' : 'password'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={() => setShowLiveKey(!showLiveKey)} edge="end">
                        {showLiveKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => handleCopyApiKey(apiKeys.liveKey)}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Test API Key
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use for testing environment
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleRegenerateApiKey('test')}
                >
                  Regenerate
                </Button>
              </Box>
              
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  value={apiKeys.testKey}
                  type={showTestKey ? 'text' : 'password'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={() => setShowTestKey(!showTestKey)} edge="end">
                        {showTestKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => handleCopyApiKey(apiKeys.testKey)}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              API Key Permissions
            </Typography>
            
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Read Access (View balances, transactions, etc.)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Write Access (Create deposit/redeem requests)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Transfer Access (Initiate transfers)"
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => setSnackbar({
                    open: true,
                    message: 'Permissions updated successfully',
                    severity: 'success'
                  })}
                >
                  Update Permissions
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Developer Tab */}
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Developer Resources
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    API Reference
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Comprehensive documentation for the NEDA Pay API endpoints, including request and response formats.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/api-reference"
                    target="_blank"
                  >
                    View API Reference
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SDK & Libraries
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Download our client libraries for various programming languages to integrate with NEDA Pay.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/sdk-libraries"
                    target="_blank"
                  >
                    View SDKs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Webhooks
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Configure webhooks to receive real-time notifications about events in your NEDA Pay account.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/webhooks"
                    target="_blank"
                  >
                    Configure Webhooks
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Applications
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Explore sample applications that demonstrate how to integrate with NEDA Pay.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/examples"
                    target="_blank"
                  >
                    View Examples
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Documentation Tab */}
        <TabPanel value={value} index={3}>
          <Typography variant="h6" gutterBottom>
            Documentation
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Getting Started
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Learn the basics of NEDA Pay and how to integrate it into your application.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/getting-started"
                    target="_blank"
                  >
                    Read Guide
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Smart Contract Documentation
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Detailed documentation of the TSHC stablecoin smart contracts.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/smart-contracts"
                    target="_blank"
                  >
                    View Contracts
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tutorials
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Step-by-step tutorials for common integration scenarios.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/tutorials"
                    target="_blank"
                  >
                    View Tutorials
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Frequently Asked Questions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Find answers to common questions about NEDA Pay.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold">
                    What is TSHC?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    TSHC (Tanzania Shilling Stablecoin) is a stablecoin pegged 1:1 to the Tanzania Shilling (TSH). It is backed by a reserve of TSH government bonds, T-bills, and cash equivalents.
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold">
                    How do I integrate TSHC into my application?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    You can integrate TSHC using our API or by directly interacting with the smart contracts. See our developer documentation for more details.
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold">
                    Is there a fee for using NEDA Pay?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Yes, there are small fees for certain operations. Please see our pricing page for more details.
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    href="https://neda-labs.gitbook.io/tshc-docs/faq"
                    target="_blank"
                    sx={{ mt: 2 }}
                  >
                    View All FAQs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
