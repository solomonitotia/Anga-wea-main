// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Link,
  Container,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  ArrowBack,
  Email,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a theme with green as primary color (same as other auth pages)
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // This would typically call your authentication service
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSuccess(true);
    } catch (error) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
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
                {/* Password reset illustration */}
                <img
                  src="/assets/forgot-password-illustration.svg" 
                  alt="Forgot Password Illustration"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
            </Box>

            {/* Right section with forgot password form */}
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

              {success ? (
                // Success state
                <Box sx={{ textAlign: 'center', py: 4 }}>
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
                    <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Check Your Email
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    We've sent a password reset link to:
                  </Typography>
                  
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 3 }}>
                    {email}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Please check your email and follow the instructions to reset your password. If you don't see the email, check your spam folder.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      bgcolor: 'primary.main'
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              ) : (
                // Request form state
                <Box component="form" onSubmit={handleSubmit}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{ mb: 2 }}
                  >
                    Forgot Password
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Enter your email address and we'll send you a link to reset your password
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 4 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      mb: 3,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <ArrowBack fontSize="small" sx={{ mr: 1 }} />
                      Back to Login
                    </Link>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;