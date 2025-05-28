import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Avatar,
  useTheme as useMuiTheme,
  alpha,
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AccountBalanceOutlined, Security, LightMode, DarkMode } from '@mui/icons-material';

const Login: React.FC = () => {
  const { login, isAuthenticated, error } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userType, setUserType] = useState<string>('central_bank');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Set email based on selected user type for demo
    let demoEmail = '';
    switch (userType) {
      case 'central_bank':
        demoEmail = 'central@example.com';
        break;
      case 'partner_bank':
        demoEmail = 'partner@example.com';
        break;
      case 'regulator':
        demoEmail = 'regulator@example.com';
        break;
      default:
        demoEmail = email;
    }

    try {
      await login(demoEmail, password || 'password');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserTypeChange = (event: SelectChangeEvent) => {
    setUserType(event.target.value);
    
    // Set email based on selected user type
    switch (event.target.value) {
      case 'central_bank':
        setEmail('admin@bot.go.tz');
        break;
      case 'partner_bank':
        setEmail('compliance@absa.co.tz');
        break;
      case 'regulator':
        setEmail('inspector@fra.go.tz');
        break;
      default:
        setEmail('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: mode === 'dark' 
          ? 'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%)',
        padding: 2,
        position: 'relative'
      }}
    >
      {/* Light/Dark Mode Toggle in top right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10
        }}
      >
        <Button
          onClick={toggleTheme}
          startIcon={mode === 'light' ? <DarkMode /> : <LightMode />}
          variant="outlined"
          color="inherit"
          size="small"
          sx={{
            borderRadius: 8,
            color: mode === 'dark' ? '#fff' : '#333',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            background: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
          }}
        >
          {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </Box>
      
      {/* Main content centered */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexGrow: 1
      }}>
        <Container maxWidth="sm">
        
        <Paper
          elevation={mode === 'dark' ? 4 : 2}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            background: mode === 'dark' 
              ? alpha(muiTheme.palette.background.paper, 0.8)
              : muiTheme.palette.background.paper,
            backdropFilter: 'blur(10px)',
            boxShadow: mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 2,
              background: mode === 'dark' 
                ? 'linear-gradient(45deg, #304ffe 30%, #1e88e5 90%)'
                : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <AccountBalanceOutlined sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: mode === 'dark' ? '#82b1ff' : '#1565c0',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            Securing Tanzania's Digital Financial Future
          </Typography>

          <Typography component="h1" variant="h4" sx={{ 
            mb: 1, 
            fontWeight: 700,
            background: mode === 'dark' 
              ? 'linear-gradient(45deg, #82b1ff 30%, #448aff 90%)'
              : 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NEDA Pay
          </Typography>
          
          <Typography component="h2" variant="h6" sx={{ 
            mb: 3, 
            color: mode === 'dark' ? 'text.secondary' : 'text.primary',
            fontWeight: 500 
          }}>
            Regulatory Dashboard
          </Typography>
          
          <Divider sx={{ width: '80%', mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">Login As</InputLabel>
              <Select
                labelId="user-type-label"
                id="user-type"
                value={userType}
                label="Login As"
                onChange={handleUserTypeChange}
              >
                <MenuItem value="central_bank">Central Bank</MenuItem>
                <MenuItem value="partner_bank">Partner Bank</MenuItem>
                <MenuItem value="regulator">Financial Regulator</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={userType !== ''}
              helperText={userType !== '' ? 'Email will be auto-filled based on role selection' : ''}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText='Enter your secure password'
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                background: mode === 'dark' 
                  ? 'linear-gradient(45deg, #304ffe 30%, #1e88e5 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
                }
              }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Security />}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.2)'
            }}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                Test Password: <strong>Regulator2025</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
                Contact system administrator for permanent access
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      </Box>
    </Box>
  );
};

export default Login;
