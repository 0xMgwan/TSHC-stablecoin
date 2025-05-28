import React from 'react';
import { Box, Paper, Grid, Typography, useTheme } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Left side with background image */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random?tanzania,finance)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            zIndex: 1,
            p: 4,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            TSHC
          </Typography>
          <Typography variant="h6" gutterBottom>
            Tanzania Shilling Stablecoin
          </Typography>
          <Typography variant="body1">
            Deposit TSH, mint TSHC tokens, and manage your digital assets
          </Typography>
        </Box>
      </Grid>

      {/* Right side with form */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <img 
              src="/images/neda-pay-logo.svg" 
              alt="NEDA Pay Logo" 
              style={{ height: 60, width: 'auto', marginBottom: 16 }} 
            />
            <Typography component="h1" variant="h5" color="primary" fontWeight="bold">
              TSHC Management
            </Typography>
          </Box>
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
