import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  AccountBalance as BankIcon,
  Phone as MobileIcon,
  CheckCircle as SuccessIcon,
  FileCopy as CopyIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Mock bank account details
const bankDetails = {
  bankName: 'CRDB Bank',
  accountName: 'NEDA Pay Ltd',
  accountNumber: '0150123456700',
  branch: 'Dar es Salaam Main',
  reference: 'TSHC-',
};

// Mock mobile money details
const mobileMoneyDetails = {
  provider: 'M-Pesa',
  number: '0755123456',
  accountName: 'NEDA Pay',
  reference: 'TSHC-',
};

const Deposit: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(`TSHC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  
  // Steps for the deposit process
  const steps = ['Select Method', 'Enter Amount', 'Make Payment', 'Confirm'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleDepositConfirmation = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would submit the deposit confirmation to the backend
      // await fetch('/api/deposits/confirm', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     reference,
      //     paymentMethod,
      //   }),
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDepositConfirmed(true);
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error confirming deposit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    // Reset the form
    setActiveStep(0);
    setAmount('');
    setReference(`TSHC-${Math.floor(100000 + Math.random() * 900000)}`);
    setDepositConfirmed(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Deposit TSH
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Deposit Tanzanian Shillings to mint TSHC tokens
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step content */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Payment Method
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose how you would like to deposit funds
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderColor: paymentMethod === 'bank' ? 'primary.main' : 'divider',
                    bgcolor: paymentMethod === 'bank' ? 'action.hover' : 'transparent'
                  }}
                >
                  <FormControlLabel 
                    value="bank" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BankIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">Bank Transfer</Typography>
                      </Box>
                    } 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Transfer funds from your bank account
                  </Typography>
                </Paper>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderColor: paymentMethod === 'mobile' ? 'primary.main' : 'divider',
                    bgcolor: paymentMethod === 'mobile' ? 'action.hover' : 'transparent'
                  }}
                >
                  <FormControlLabel 
                    value="mobile" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MobileIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">Mobile Money</Typography>
                      </Box>
                    } 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Send money using M-Pesa, Tigo Pesa, or Airtel Money
                  </Typography>
                </Paper>
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Deposit Amount
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Specify how much TSH you would like to deposit
            </Typography>

            <TextField
              fullWidth
              label="Amount (TSH)"
              variant="outlined"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>TSH</Typography>,
              }}
              sx={{ mb: 2 }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Minimum Deposit</AlertTitle>
              The minimum deposit amount is TSH 10,000. You will receive an equivalent amount of TSHC tokens.
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) < 10000}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Make Your Payment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please transfer {amount} TSH using the details below
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Important</AlertTitle>
              Make sure to include the reference number in your payment description to ensure proper tracking.
            </Alert>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {paymentMethod === 'bank' ? 'Bank Transfer Details' : 'Mobile Money Details'}
                </Typography>

                {paymentMethod === 'bank' ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{bankDetails.bankName}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(bankDetails.bankName)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Name</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{bankDetails.accountName}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(bankDetails.accountName)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Number</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{bankDetails.accountNumber}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(bankDetails.accountNumber)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Branch</Typography>
                      <Typography variant="body1">{bankDetails.branch}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">Reference Number (Important)</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="bold">{reference}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(reference)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Provider</Typography>
                      <Typography variant="body1">{mobileMoneyDetails.provider}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Name</Typography>
                      <Typography variant="body1">{mobileMoneyDetails.accountName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{mobileMoneyDetails.number}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(mobileMoneyDetails.number)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">Reference Number (Important)</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="bold">{reference}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyToClipboard(reference)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                I've Made the Deposit
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Your Deposit
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please confirm that you have completed the deposit of {amount} TSH
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Verification Process</AlertTitle>
              After confirmation, our team will verify your deposit. This typically takes 1-2 business hours during working days.
              Once verified, TSHC tokens will be minted to your wallet.
            </Alert>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Deposit Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                    <Typography variant="body1">TSH {amount}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Typography variant="body1">{paymentMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Reference Number</Typography>
                    <Typography variant="body1">{reference}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Expected TSHC Tokens</Typography>
                    <Typography variant="body1">{amount} TSHC</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDepositConfirmation}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Deposit'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SuccessIcon color="success" sx={{ mr: 1 }} />
            Deposit Confirmation Received
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Thank you for your deposit of TSH {amount}. Your transaction has been recorded with reference number: {reference}.
          </Typography>
          <Typography variant="body1" paragraph>
            Our team will verify your payment and mint {amount} TSHC tokens to your wallet. This process typically takes 1-2 business hours during working days.
          </Typography>
          <Typography variant="body1">
            You can track the status of your deposit in the Transactions section.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>Close</Button>
          <Button variant="contained" color="primary" onClick={() => {
            handleCloseSuccessDialog();
            window.location.href = '/transactions';
          }}>
            View Transactions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Informational Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">About TSHC Tokens</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              TSHC is a stablecoin backed 1:1 by Tanzanian Shillings (TSH). Each TSHC token is worth exactly 1 TSH and can be redeemed at any time.
              The tokens are stored in your digital wallet and can be used for various transactions on the NEDA Pay platform.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Deposit Processing</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              After you confirm your deposit, our team will verify the payment with our banking partners. Once verified, the equivalent amount of TSHC tokens will be minted to your wallet automatically. You'll receive a notification when the process is complete.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Deposit;
