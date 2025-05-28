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
  useTheme
} from '@mui/material';
import { 
  AccountBalance as BankIcon,
  Phone as MobileIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const Redeem: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  
  // Steps for the redeem process
  const steps = ['Select Method', 'Enter Amount', 'Enter Details', 'Confirm'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePayoutMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayoutMethod(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleRedeemSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would submit the redeem request to the backend
      // await fetch('/api/redeem', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     payoutMethod,
      //     ...(payoutMethod === 'bank' 
      //       ? { bankName, accountNumber, accountName } 
      //       : { mobileProvider, mobileNumber })
      //   }),
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error submitting redeem request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    // Reset the form
    setActiveStep(0);
    setAmount('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setMobileProvider('');
    setMobileNumber('');
  };

  const validateBankDetails = () => {
    return bankName && accountNumber && accountName;
  };

  const validateMobileDetails = () => {
    return mobileProvider && mobileNumber;
  };

  const isNextDisabled = () => {
    if (activeStep === 0) return false;
    if (activeStep === 1) return !amount || parseFloat(amount) < 10000;
    if (activeStep === 2) {
      return payoutMethod === 'bank' 
        ? !validateBankDetails() 
        : !validateMobileDetails();
    }
    return false;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Redeem TSHC
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Convert your TSHC tokens back to Tanzanian Shillings
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
              Select Payout Method
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose how you would like to receive your funds
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                aria-label="payout-method"
                name="payout-method"
                value={payoutMethod}
                onChange={handlePayoutMethodChange}
              >
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderColor: payoutMethod === 'bank' ? 'primary.main' : 'divider',
                    bgcolor: payoutMethod === 'bank' ? 'action.hover' : 'transparent'
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
                    Receive funds directly to your bank account
                  </Typography>
                </Paper>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderColor: payoutMethod === 'mobile' ? 'primary.main' : 'divider',
                    bgcolor: payoutMethod === 'mobile' ? 'action.hover' : 'transparent'
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
                    Receive funds to your mobile money account
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
              Enter Redemption Amount
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Specify how many TSHC tokens you would like to redeem
            </Typography>

            <TextField
              fullWidth
              label="Amount (TSHC)"
              variant="outlined"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>TSHC</Typography>,
              }}
              sx={{ mb: 2 }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Minimum Redemption</AlertTitle>
              The minimum redemption amount is 10,000 TSHC. You will receive an equivalent amount in TSH minus any applicable fees.
            </Alert>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Processing Time</AlertTitle>
              Redemption requests are typically processed within 1-2 business days.
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
              Enter Payout Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide your {payoutMethod === 'bank' ? 'bank account' : 'mobile money'} details
            </Typography>

            {payoutMethod === 'bank' ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    variant="outlined"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    variant="outlined"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    variant="outlined"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    helperText="Enter the name exactly as it appears on your bank account"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel id="mobile-provider-label">Mobile Money Provider</FormLabel>
                    <RadioGroup
                      aria-labelledby="mobile-provider-label"
                      name="mobile-provider"
                      value={mobileProvider}
                      onChange={(e) => setMobileProvider(e.target.value)}
                      row
                    >
                      <FormControlLabel value="mpesa" control={<Radio />} label="M-Pesa" />
                      <FormControlLabel value="tigopesa" control={<Radio />} label="Tigo Pesa" />
                      <FormControlLabel value="airtelmoney" control={<Radio />} label="Airtel Money" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    variant="outlined"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    placeholder="e.g., 0755123456"
                    helperText="Enter the mobile number associated with your mobile money account"
                  />
                </Grid>
              </Grid>
            )}

            <Alert severity="warning" sx={{ mt: 3 }}>
              <AlertTitle>Verification Required</AlertTitle>
              Please ensure all details are correct. Funds sent to incorrect accounts cannot be recovered.
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
                disabled={payoutMethod === 'bank' ? !validateBankDetails() : !validateMobileDetails()}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Redemption
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review and confirm your redemption request
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Redemption Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Amount to Redeem</Typography>
                    <Typography variant="body1">{amount} TSHC</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Payout Method</Typography>
                    <Typography variant="body1">{payoutMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</Typography>
                  </Grid>
                  
                  {payoutMethod === 'bank' ? (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>Bank Details</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                        <Typography variant="body1">{bankName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Account Number</Typography>
                        <Typography variant="body1">{accountNumber}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                        <Typography variant="body1">{accountName}</Typography>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>Mobile Money Details</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Provider</Typography>
                        <Typography variant="body1">
                          {mobileProvider === 'mpesa' ? 'M-Pesa' : 
                           mobileProvider === 'tigopesa' ? 'Tigo Pesa' : 'Airtel Money'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                        <Typography variant="body1">{mobileNumber}</Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">Expected Payout</Typography>
                    <Typography variant="body1">TSH {amount}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Processing Time</Typography>
                    <Typography variant="body1">1-2 business days</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Important Notice</AlertTitle>
              By confirming this redemption, you authorize NEDA Pay to burn {amount} TSHC tokens from your wallet and transfer the equivalent amount in TSH to your specified account.
              This action cannot be reversed once processed.
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
                onClick={handleRedeemSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Redemption'}
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
            Redemption Request Submitted
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Your request to redeem {amount} TSHC has been submitted successfully.
          </Typography>
          <Typography variant="body1" paragraph>
            The tokens will be burned from your wallet, and the equivalent amount in TSH will be transferred to your {payoutMethod === 'bank' ? 'bank account' : 'mobile money account'} within 1-2 business days.
          </Typography>
          <Typography variant="body1">
            You can track the status of your redemption in the Transactions section.
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
              <Typography variant="h6">About Redemption</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              When you redeem TSHC tokens, they are burned (removed from circulation), and the equivalent amount in TSH is transferred to your specified account.
              This maintains the 1:1 backing of all TSHC tokens in circulation.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Important Information</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Please ensure that all account details are accurate. NEDA Pay is not responsible for funds sent to incorrect accounts.
              Redemption requests are processed during business hours and may take 1-2 business days to complete.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Redeem;
