// src/pages/Login.jsx
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
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook

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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    // Validate form inputs
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    // Clear any previous errors
    setError('');
    setLoading(true);
    
    // Use the login function from AuthContext
    try {
      // Create a user object to be stored
      const user = { 
        email, 
        name: email.split('@')[0],
        role: 'user'
      };
      
      // Call the login function from context
      login(user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Login failed. Please try again.');
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
                {/* Weather illustration */}
                <img
                  src="/assets/weather-person.svg" 
                  alt="Weather Illustration"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
            </Box>

            {/* Right section with login form */}
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
                sx={{ mb: 4 }}
              >
                Login
              </Typography>

              {error && (
                <Typography 
                  color="error" 
                  variant="body2" 
                  sx={{ mb: 2, p: 1, bgcolor: '#ffebee', borderRadius: 1 }}
                >
                  {error}
                </Typography>
              )}

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Email/Username
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="solomonkamau19@gmail.com"
                  sx={{ mb: 3 }}
                />

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
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
                  />

                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    color="primary"
                    variant="body2"
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Login'
                  )}
                </Button>

                <Button
                  component={RouterLink}
                  to="/register"
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3, borderColor: 'primary.main', color: 'primary.main' }}
                >
                  Register
                </Button>

                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  or signup with
                </Typography>

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
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;