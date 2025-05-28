import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  AlertTitle,
  Checkbox,
  FormControlLabel,
  Stack,
  Container,
  IconButton,
  Chip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  CheckCircleOutline as SuccessIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  VerifiedUser as VerifiedIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CameraAlt as CameraIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schemas
const personalInfoSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'You must be at least 18 years old'),
  nationality: Yup.string().required('Nationality is required'),
  gender: Yup.string().required('Gender is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const addressInfoSchema = Yup.object({
  streetAddress: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  region: Yup.string().required('Region is required'),
  postalCode: Yup.string().required('Postal code is required'),
  country: Yup.string().required('Country is required'),
  residenceType: Yup.string().required('Residence type is required'),
});

const documentSchema = Yup.object({
  idType: Yup.string().required('ID type is required'),
  idNumber: Yup.string().required('ID number is required'),
  idExpiryDate: Yup.date()
    .required('Expiry date is required')
    .min(new Date(), 'ID must not be expired'),
  idFrontImage: Yup.mixed().required('Front image of ID is required'),
  idBackImage: Yup.mixed().required('Back image of ID is required'),
  selfieImage: Yup.mixed().required('Selfie image is required'),
});

const bankInfoSchema = Yup.object({
  bankName: Yup.string().required('Bank name is required'),
  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(/^[0-9]{10,16}$/, 'Invalid account number format'),
  accountName: Yup.string().required('Account name is required'),
  branchName: Yup.string().required('Branch name is required'),
  swiftCode: Yup.string().required('SWIFT/BIC code is required'),
  walletAddress: Yup.string()
    .required('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address format'),
});

const termsSchema = Yup.object({
  acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  acceptPrivacyPolicy: Yup.boolean().oneOf([true], 'You must accept the privacy policy'),
  acceptDataProcessing: Yup.boolean().oneOf([true], 'You must consent to data processing'),
});

// Countries list (abbreviated)
const countries = [
  { value: 'tz', label: 'Tanzania' },
  { value: 'ke', label: 'Kenya' },
  { value: 'ug', label: 'Uganda' },
  { value: 'rw', label: 'Rwanda' },
  { value: 'bi', label: 'Burundi' },
  { value: 'cd', label: 'Democratic Republic of the Congo' },
  { value: 'za', label: 'South Africa' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'gh', label: 'Ghana' },
  { value: 'et', label: 'Ethiopia' },
];

// ID types available for selection
const idTypes = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'voter_id', label: 'Voter ID' },
];

// Residence types
const residenceTypes = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'family', label: 'Living with Family' },
  { value: 'other', label: 'Other' },
];

// Banks in Tanzania
const tanzanianBanks = [
  { value: 'crdb', label: 'CRDB Bank' },
  { value: 'nmb', label: 'NMB Bank' },
  { value: 'nbc', label: 'NBC Bank' },
  { value: 'absa', label: 'ABSA Bank Tanzania' },
  { value: 'stanbic', label: 'Stanbic Bank' },
  { value: 'dtb', label: 'Diamond Trust Bank' },
  { value: 'exim', label: 'Exim Bank' },
  { value: 'kcb', label: 'KCB Bank' },
  { value: 'tpb', label: 'TPB Bank (Tanzania Postal Bank)' },
  { value: 'other', label: 'Other' },
];

// Main KYC component for user verification
const KycManagement: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'>('not_started');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  // File upload references
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  
  // Preview states for uploaded documents
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Steps for the KYC process
  const steps = ['Personal Information', 'Address Details', 'Identity Verification', 'Bank Details', 'Review & Submit'];


  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // State to track if redirection should happen
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Effect to handle redirection after KYC submission
  useEffect(() => {
    if (shouldRedirect) {
      // Set a short timeout to show the success message briefly before redirecting
      const redirectTimer = setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000); // 3 seconds delay
      
      return () => clearTimeout(redirectTimer);
    }
  }, [shouldRedirect]);

  // Handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would submit all form data to the backend
      // await fetch('/api/kyc/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     personalInfo: personalInfoFormik.values,
      //     addressInfo: addressInfoFormik.values,
      //     documentInfo: documentFormik.values,
      //     bankInfo: bankInfoFormik.values,
      //     termsAccepted: termsFormik.values
      //   })
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update KYC status to pending review and trigger redirect
      setKycStatus('pending_review');
      setShouldRedirect(true);
    } catch (error) {
      console.error('Error submitting KYC:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form for personal information
  const personalInfoFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'tz', // Default to Tanzania
      gender: '',
      phoneNumber: '',
      email: '',
    },
    validationSchema: personalInfoSchema,
    onSubmit: () => {
      handleNext();
    },
  });

  // Form for address information
  const addressInfoFormik = useFormik({
    initialValues: {
      streetAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'tz', // Default to Tanzania
      residenceType: '',
    },
    validationSchema: addressInfoSchema,
    onSubmit: () => {
      handleNext();
    },
  });

  // Form for document verification
  const documentFormik = useFormik({
    initialValues: {
      idType: '',
      idNumber: '',
      idExpiryDate: '',
      idFrontImage: null,
      idBackImage: null,
      selfieImage: null,
    },
    validationSchema: documentSchema,
    onSubmit: () => {
      handleNext();
    },
  });

  // Form for bank details
  const bankInfoFormik = useFormik({
    initialValues: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      branchName: '',
      swiftCode: '',
      walletAddress: '',
    },
    validationSchema: bankInfoSchema,
    onSubmit: () => {
      handleNext();
    },
  });

  // Form for terms and conditions
  const termsFormik = useFormik({
    initialValues: {
      acceptTerms: false,
      acceptPrivacyPolicy: false,
      acceptDataProcessing: false,
    },
    validationSchema: termsSchema,
    onSubmit: () => {
      handleNext();
    },
  });
  
  // Handle document upload button clicks
  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  
  // Handle file input changes
  const handleIdFrontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      documentFormik.setFieldValue('idFrontImage', file);
      handleFileUpload(event, setIdFrontPreview);
    }
  };
  
  const handleIdBackUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      documentFormik.setFieldValue('idBackImage', file);
      handleFileUpload(event, setIdBackPreview);
    }
  };
  
  const handleSelfieUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      documentFormik.setFieldValue('selfieImage', file);
      handleFileUpload(event, setSelfiePreview);
    }
  };

  // Render different content based on KYC status
  if (kycStatus === 'approved') {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            KYC Verification Approved
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your identity has been successfully verified. You now have full access to all NEDA Pay features.
          </Typography>
          <Button variant="contained" startIcon={<HomeIcon />} href="/dashboard">
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Verification Failed</AlertTitle>
            {rejectionReason || 'Your KYC verification was not approved. Please review the feedback and resubmit.'}
          </Alert>
          <Button variant="contained" onClick={() => setKycStatus('not_started')}>
            Resubmit KYC
          </Button>
        </Box>
      </Container>
    );
  }

  if (kycStatus === 'pending_review') {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Submission Successful</AlertTitle>
            Your KYC information has been submitted successfully. Redirecting to dashboard...
          </Alert>
          <CircularProgress size={24} sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            Your verification is now under review. This process typically takes 1-2 business days.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you're not redirected automatically, 
            <Button 
              variant="text" 
              startIcon={<HomeIcon />} 
              href="/dashboard"
              sx={{ ml: 1 }}
            >
              click here
            </Button>
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Identity Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your KYC verification to access all NEDA Pay features and increase your transaction limits
        </Typography>
      </Box>
      
      {/* Stepper component */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* Form content based on active step */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {activeStep === 0 && (
          <form onSubmit={personalInfoFormik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide your personal details exactly as they appear on your official documents.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={personalInfoFormik.values.firstName}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.firstName && Boolean(personalInfoFormik.errors.firstName)}
                  helperText={personalInfoFormik.touched.firstName && personalInfoFormik.errors.firstName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={personalInfoFormik.values.lastName}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.lastName && Boolean(personalInfoFormik.errors.lastName)}
                  helperText={personalInfoFormik.touched.lastName && personalInfoFormik.errors.lastName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={personalInfoFormik.values.dateOfBirth}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.dateOfBirth && Boolean(personalInfoFormik.errors.dateOfBirth)}
                  helperText={personalInfoFormik.touched.dateOfBirth && personalInfoFormik.errors.dateOfBirth}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="nationality"
                  name="nationality"
                  select
                  label="Nationality"
                  value={personalInfoFormik.values.nationality}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.nationality && Boolean(personalInfoFormik.errors.nationality)}
                  helperText={personalInfoFormik.touched.nationality && personalInfoFormik.errors.nationality}
                  required
                >
                  {countries.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="gender"
                  name="gender"
                  select
                  label="Gender"
                  value={personalInfoFormik.values.gender}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.gender && Boolean(personalInfoFormik.errors.gender)}
                  helperText={personalInfoFormik.touched.gender && personalInfoFormik.errors.gender}
                  required
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+255XXXXXXXXX"
                  value={personalInfoFormik.values.phoneNumber}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.phoneNumber && Boolean(personalInfoFormik.errors.phoneNumber)}
                  helperText={personalInfoFormik.touched.phoneNumber && personalInfoFormik.errors.phoneNumber}
                  required
                  InputProps={{
                    startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={personalInfoFormik.values.email}
                  onChange={personalInfoFormik.handleChange}
                  onBlur={personalInfoFormik.handleBlur}
                  error={personalInfoFormik.touched.email && Boolean(personalInfoFormik.errors.email)}
                  helperText={personalInfoFormik.touched.email && personalInfoFormik.errors.email}
                  required
                  InputProps={{
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<ForwardIcon />}
              >
                Next
              </Button>
            </Box>
          </form>
        )}
        
        {activeStep === 1 && (
          <form onSubmit={addressInfoFormik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Address Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide your current residential address information.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="streetAddress"
                  name="streetAddress"
                  label="Street Address"
                  value={addressInfoFormik.values.streetAddress}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.streetAddress && Boolean(addressInfoFormik.errors.streetAddress)}
                  helperText={addressInfoFormik.touched.streetAddress && addressInfoFormik.errors.streetAddress}
                  required
                  InputProps={{
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  value={addressInfoFormik.values.city}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.city && Boolean(addressInfoFormik.errors.city)}
                  helperText={addressInfoFormik.touched.city && addressInfoFormik.errors.city}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="region"
                  name="region"
                  label="Region/State/Province"
                  value={addressInfoFormik.values.region}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.region && Boolean(addressInfoFormik.errors.region)}
                  helperText={addressInfoFormik.touched.region && addressInfoFormik.errors.region}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="postalCode"
                  name="postalCode"
                  label="Postal Code"
                  value={addressInfoFormik.values.postalCode}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.postalCode && Boolean(addressInfoFormik.errors.postalCode)}
                  helperText={addressInfoFormik.touched.postalCode && addressInfoFormik.errors.postalCode}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="country"
                  name="country"
                  select
                  label="Country"
                  value={addressInfoFormik.values.country}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.country && Boolean(addressInfoFormik.errors.country)}
                  helperText={addressInfoFormik.touched.country && addressInfoFormik.errors.country}
                  required
                >
                  {countries.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="residenceType"
                  name="residenceType"
                  select
                  label="Residence Type"
                  value={addressInfoFormik.values.residenceType}
                  onChange={addressInfoFormik.handleChange}
                  onBlur={addressInfoFormik.handleBlur}
                  error={addressInfoFormik.touched.residenceType && Boolean(addressInfoFormik.errors.residenceType)}
                  helperText={addressInfoFormik.touched.residenceType && addressInfoFormik.errors.residenceType}
                  required
                >
                  {residenceTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<ForwardIcon />}
              >
                Next
              </Button>
            </Box>
          </form>
        )}

        {/* Document verification form */}
        {activeStep === 2 && (
          <form onSubmit={documentFormik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Identity Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please upload clear images of your identification documents and a recent selfie.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="idType"
                  name="idType"
                  select
                  label="ID Type"
                  value={documentFormik.values.idType}
                  onChange={documentFormik.handleChange}
                  onBlur={documentFormik.handleBlur}
                  error={documentFormik.touched.idType && Boolean(documentFormik.errors.idType)}
                  helperText={documentFormik.touched.idType && documentFormik.errors.idType}
                  required
                >
                  {idTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="idNumber"
                  name="idNumber"
                  label="ID Number"
                  value={documentFormik.values.idNumber}
                  onChange={documentFormik.handleChange}
                  onBlur={documentFormik.handleBlur}
                  error={documentFormik.touched.idNumber && Boolean(documentFormik.errors.idNumber)}
                  helperText={documentFormik.touched.idNumber && documentFormik.errors.idNumber}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="idExpiryDate"
                  name="idExpiryDate"
                  label="ID Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={documentFormik.values.idExpiryDate}
                  onChange={documentFormik.handleChange}
                  onBlur={documentFormik.handleBlur}
                  error={documentFormik.touched.idExpiryDate && Boolean(documentFormik.errors.idExpiryDate)}
                  helperText={documentFormik.touched.idExpiryDate && documentFormik.errors.idExpiryDate}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Document Uploads
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Front of ID
                    </Typography>
                    <Box 
                      sx={{ 
                        height: 200, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        mb: 2,
                        p: 1,
                        bgcolor: idFrontPreview ? 'transparent' : 'grey.100'
                      }}
                    >
                      {idFrontPreview ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img 
                            src={idFrontPreview} 
                            alt="ID Front" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                          <IconButton 
                            size="small" 
                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => {
                              setIdFrontPreview(null);
                              documentFormik.setFieldValue('idFrontImage', null);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" align="center">
                            Click to upload front of your ID
                          </Typography>
                        </>
                      )}
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      ref={idFrontRef}
                      style={{ display: 'none' }}
                      onChange={handleIdFrontUpload}
                    />
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => triggerFileInput(idFrontRef)}
                    >
                      Upload Front
                    </Button>
                    {documentFormik.touched.idFrontImage && documentFormik.errors.idFrontImage && (
                      <Typography color="error" variant="caption">
                        {documentFormik.errors.idFrontImage as string}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Back of ID
                    </Typography>
                    <Box 
                      sx={{ 
                        height: 200, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        mb: 2,
                        p: 1,
                        bgcolor: idBackPreview ? 'transparent' : 'grey.100'
                      }}
                    >
                      {idBackPreview ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img 
                            src={idBackPreview} 
                            alt="ID Back" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                          <IconButton 
                            size="small" 
                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => {
                              setIdBackPreview(null);
                              documentFormik.setFieldValue('idBackImage', null);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" align="center">
                            Click to upload back of your ID
                          </Typography>
                        </>
                      )}
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      ref={idBackRef}
                      style={{ display: 'none' }}
                      onChange={handleIdBackUpload}
                    />
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => triggerFileInput(idBackRef)}
                    >
                      Upload Back
                    </Button>
                    {documentFormik.touched.idBackImage && documentFormik.errors.idBackImage && (
                      <Typography color="error" variant="caption">
                        {documentFormik.errors.idBackImage as string}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Selfie with ID
                    </Typography>
                    <Box 
                      sx={{ 
                        height: 200, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        mb: 2,
                        p: 1,
                        bgcolor: selfiePreview ? 'transparent' : 'grey.100'
                      }}
                    >
                      {selfiePreview ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img 
                            src={selfiePreview} 
                            alt="Selfie" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                          <IconButton 
                            size="small" 
                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => {
                              setSelfiePreview(null);
                              documentFormik.setFieldValue('selfieImage', null);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <CameraIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" align="center">
                            Click to upload a selfie with your ID
                          </Typography>
                        </>
                      )}
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      ref={selfieRef}
                      style={{ display: 'none' }}
                      onChange={handleSelfieUpload}
                    />
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CameraIcon />}
                      onClick={() => triggerFileInput(selfieRef)}
                    >
                      Upload Selfie
                    </Button>
                    {documentFormik.touched.selfieImage && documentFormik.errors.selfieImage && (
                      <Typography color="error" variant="caption">
                        {documentFormik.errors.selfieImage as string}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<ForwardIcon />}
              >
                Next
              </Button>
            </Box>
          </form>
        )}
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Personal Information</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Provide your basic personal details including name, date of birth, and contact information.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Address Details</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Verify your current residential address and provide proof of residence.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DocumentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Identity Verification</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Upload your identification documents and a selfie for verification.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BankIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Bank Details</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Link your bank account for seamless transactions and withdrawals.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VerifiedIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Review & Submit</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Review all your information and submit your KYC application for verification.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Bank details form */}
      {activeStep === 3 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={bankInfoFormik.handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Bank Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide your bank account information for transactions and withdrawals.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="bankName"
                  name="bankName"
                  select
                  label="Bank Name"
                  value={bankInfoFormik.values.bankName}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.bankName && Boolean(bankInfoFormik.errors.bankName)}
                  helperText={bankInfoFormik.touched.bankName && bankInfoFormik.errors.bankName}
                  required
                  InputProps={{
                    startAdornment: <BankIcon color="action" sx={{ mr: 1 }} />,
                  }}
                >
                  {tanzanianBanks.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="accountNumber"
                  name="accountNumber"
                  label="Account Number"
                  value={bankInfoFormik.values.accountNumber}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.accountNumber && Boolean(bankInfoFormik.errors.accountNumber)}
                  helperText={bankInfoFormik.touched.accountNumber && bankInfoFormik.errors.accountNumber}
                  required
                  InputProps={{
                    startAdornment: <CardIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="accountName"
                  name="accountName"
                  label="Account Holder Name"
                  value={bankInfoFormik.values.accountName}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.accountName && Boolean(bankInfoFormik.errors.accountName)}
                  helperText={bankInfoFormik.touched.accountName && bankInfoFormik.errors.accountName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="branchName"
                  name="branchName"
                  label="Branch Name"
                  value={bankInfoFormik.values.branchName}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.branchName && Boolean(bankInfoFormik.errors.branchName)}
                  helperText={bankInfoFormik.touched.branchName && bankInfoFormik.errors.branchName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="swiftCode"
                  name="swiftCode"
                  label="SWIFT/BIC Code"
                  value={bankInfoFormik.values.swiftCode}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.swiftCode && Boolean(bankInfoFormik.errors.swiftCode)}
                  helperText={bankInfoFormik.touched.swiftCode && bankInfoFormik.errors.swiftCode}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Designated Wallet for Minting & Burning
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please provide the Ethereum wallet address that will be used for minting and burning TSHC tokens.
                </Typography>
                <TextField
                  fullWidth
                  id="walletAddress"
                  name="walletAddress"
                  label="Wallet Address"
                  placeholder="0x..."
                  value={bankInfoFormik.values.walletAddress}
                  onChange={bankInfoFormik.handleChange}
                  onBlur={bankInfoFormik.handleBlur}
                  error={bankInfoFormik.touched.walletAddress && Boolean(bankInfoFormik.errors.walletAddress)}
                  helperText={bankInfoFormik.touched.walletAddress && bankInfoFormik.errors.walletAddress}
                  required
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<ForwardIcon />}
              >
                Next
              </Button>
            </Box>
          </form>
        </Paper>
      )}
      
      {/* Review and submit */}
      {activeStep === 4 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Review & Submit
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please review your information before submitting your KYC application.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Personal Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {personalInfoFormik.values.firstName} {personalInfoFormik.values.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {personalInfoFormik.values.dateOfBirth}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Nationality
                      </Typography>
                      <Typography variant="body1">
                        {countries.find(c => c.value === personalInfoFormik.values.nationality)?.label || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gender
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {personalInfoFormik.values.gender}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">
                        {personalInfoFormik.values.phoneNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {personalInfoFormik.values.email}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Button
                    size="small"
                    onClick={() => setActiveStep(0)}
                    sx={{ mt: 2 }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Address Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Street Address
                      </Typography>
                      <Typography variant="body1">
                        {addressInfoFormik.values.streetAddress}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1">
                        {addressInfoFormik.values.city}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Region/State
                      </Typography>
                      <Typography variant="body1">
                        {addressInfoFormik.values.region}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Postal Code
                      </Typography>
                      <Typography variant="body1">
                        {addressInfoFormik.values.postalCode}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Country
                      </Typography>
                      <Typography variant="body1">
                        {countries.find(c => c.value === addressInfoFormik.values.country)?.label || ''}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Button
                    size="small"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 2 }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DocumentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Identity Verification
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ID Type
                      </Typography>
                      <Typography variant="body1">
                        {idTypes.find(t => t.value === documentFormik.values.idType)?.label || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ID Number
                      </Typography>
                      <Typography variant="body1">
                        {documentFormik.values.idNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ID Expiry Date
                      </Typography>
                      <Typography variant="body1">
                        {documentFormik.values.idExpiryDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Document Uploads
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          icon={<UploadIcon />} 
                          label="ID Front" 
                          color={idFrontPreview ? "success" : "default"} 
                          variant="outlined" 
                        />
                        <Chip 
                          icon={<UploadIcon />} 
                          label="ID Back" 
                          color={idBackPreview ? "success" : "default"} 
                          variant="outlined" 
                        />
                        <Chip 
                          icon={<CameraIcon />} 
                          label="Selfie" 
                          color={selfiePreview ? "success" : "default"} 
                          variant="outlined" 
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                  <Button
                    size="small"
                    onClick={() => setActiveStep(2)}
                    sx={{ mt: 2 }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BankIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Bank Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bank Name
                      </Typography>
                      <Typography variant="body1">
                        {tanzanianBanks.find(b => b.value === bankInfoFormik.values.bankName)?.label || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Account Number
                      </Typography>
                      <Typography variant="body1">
                        {bankInfoFormik.values.accountNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Account Holder Name
                      </Typography>
                      <Typography variant="body1">
                        {bankInfoFormik.values.accountName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Branch Name
                      </Typography>
                      <Typography variant="body1">
                        {bankInfoFormik.values.branchName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        SWIFT/BIC Code
                      </Typography>
                      <Typography variant="body1">
                        {bankInfoFormik.values.swiftCode}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Wallet Address for Minting & Burning
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {bankInfoFormik.values.walletAddress}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Button
                    size="small"
                    onClick={() => setActiveStep(3)}
                    sx={{ mt: 2 }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Terms and Conditions
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsFormik.values.acceptTerms}
                        onChange={termsFormik.handleChange}
                        name="acceptTerms"
                        color="primary"
                      />
                    }
                    label="I accept the Terms and Conditions"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsFormik.values.acceptPrivacyPolicy}
                        onChange={termsFormik.handleChange}
                        name="acceptPrivacyPolicy"
                        color="primary"
                      />
                    }
                    label="I accept the Privacy Policy"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsFormik.values.acceptDataProcessing}
                        onChange={termsFormik.handleChange}
                        name="acceptDataProcessing"
                        color="primary"
                      />
                    }
                    label="I consent to the processing of my personal data for KYC verification purposes"
                  />
                  {(termsFormik.touched.acceptTerms && termsFormik.errors.acceptTerms) || 
                   (termsFormik.touched.acceptPrivacyPolicy && termsFormik.errors.acceptPrivacyPolicy) || 
                   (termsFormik.touched.acceptDataProcessing && termsFormik.errors.acceptDataProcessing) ? (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      You must accept all terms and conditions to proceed
                    </Typography>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!termsFormik.values.acceptTerms || !termsFormik.values.acceptPrivacyPolicy || !termsFormik.values.acceptDataProcessing || isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={20} /> : <SuccessIcon />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC'}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default KycManagement;
