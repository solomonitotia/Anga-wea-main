// src/pages/Register.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Checkbox,
  FormControlLabel,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  Container,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  Check
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a theme with green as primary color
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#e8f5e9',
      dark: '#388E3C',
    },
    background: {
      default: '#e8f5e9',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          padding: '10px 0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f9ff',
          borderRadius: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');

  // Steps for registration process
  const steps = ['Personal Details', 'Account Setup', 'Confirmation'];

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateStep = (step) => {
    setError('');
    
    if (step === 0) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('First name and last name are required');
        return false;
      }
    } else if (step === 1) {
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!formData.password.trim()) {
        setError('Password is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!acceptTerms) {
        setError('Please accept the terms and conditions');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRegister = () => {
    if (validateStep(1)) {
      // Here you would typically handle the registration process
      console.log('Register with:', formData);
      setActiveStep(2); // Move to confirmation step
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ mx: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              borderRadius: 3,
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {/* Left section with illustration */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                width: '50%',
                p: 4,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                >
                  AngaTech 1.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Public Platform
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  p: 2,
                }}
              >
                {/* Weather registration illustration */}
                <img
                  src="/assets/register-illustration.svg" 
                  alt="Registration Illustration"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
            </Box>

            {/* Right section with registration form */}
            <Box
              sx={{
                width: { xs: '100%', md: '50%' },
                p: 4,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Mobile branding (only visible on small screens) */}
              <Box sx={{ 
                display: { xs: 'block', md: 'none' }, 
                mb: 3 
              }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                >
                  AngaTech 1.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Public Platform
                </Typography>
              </Box>

              <Typography
                variant="h4"
                component="h1"
                sx={{ mb: 2 }}
              >
                Register
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your account to access the AngaTech platform
              </Typography>

              {/* Stepper for registration process */}
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel 
                sx={{ mb: 4 }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              {/* Step 1: Personal Details */}
              {activeStep === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        sx={{ mb: 3 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        sx={{ mb: 3 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 2 
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={goToLogin}
                      sx={{ 
                        width: '48%',
                        borderColor: 'primary.main', 
                        color: 'primary.main'
                      }}
                    >
                      Back to Login
                    </Button>
                    
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={handleNext}
                      sx={{ 
                        width: '48%',
                        bgcolor: 'primary.main'
                      }}
                    >
                      Next Step
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Account Setup */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    sx={{ mb: 3 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I accept the terms and conditions
                      </Typography>
                    }
                    sx={{ mb: 3 }}
                  />
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between' 
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={handleBack}
                      sx={{ 
                        width: '48%',
                        borderColor: 'primary.main', 
                        color: 'primary.main'
                      }}
                    >
                      Back
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleRegister}
                      sx={{ 
                        width: '48%',
                        bgcolor: 'primary.main'
                      }}
                    >
                      Create Account
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 2 && (
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    py: 4 
                  }}
                >
                  <Box 
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <Check sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Registration Successful!
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Your account has been created successfully. You can now login to access the AngaTech platform.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={goToLogin}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      bgcolor: 'primary.main'
                    }}
                  >
                    Proceed to Login
                  </Button>
                </Box>
              )}

              {/* Social media options (only show in steps 0 and 1) */}
              {activeStep < 2 && (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      my: 3
                    }}
                  >
                    <Box sx={{ flex: 1, borderBottom: 1, borderColor: 'divider' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                      or register with
                    </Typography>
                    <Box sx={{ flex: 1, borderBottom: 1, borderColor: 'divider' }} />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    {/* Social media icons */}
                    <IconButton
                      sx={{
                        color: '#1877F2',
                        '&:hover': { bgcolor: 'rgba(24, 119, 242, 0.1)' },
                      }}
                    >
                      <img
                        src="/assets/facebook-icon.svg"
                        alt="Facebook"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: '#E4405F',
                        '&:hover': { bgcolor: 'rgba(228, 64, 95, 0.1)' },
                      }}
                    >
                      <img
                        src="/assets/instagram-icon.svg"
                        alt="Instagram"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: '#0A66C2',
                        '&:hover': { bgcolor: 'rgba(10, 102, 194, 0.1)' },
                      }}
                    >
                      <img
                        src="/assets/linkedin-icon.svg"
                        alt="LinkedIn"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: '#1DA1F2',
                        '&:hover': { bgcolor: 'rgba(29, 161, 242, 0.1)' },
                      }}
                    >
                      <img
                        src="/assets/twitter-icon.svg"
                        alt="Twitter"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;