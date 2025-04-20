// src/pages/Login.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Link, 
  InputAdornment, 
  IconButton, 
  Divider,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock as LockIcon,
  Email as EmailIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Microsoft as MicrosoftIcon
} from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider // For Microsoft
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Standard Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.code === 'auth/user-not-found' ? 'User not found' :
        error.code === 'auth/wrong-password' ? 'Invalid password' :
        error.code === 'auth/invalid-email' ? 'Invalid email format' :
        'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Social Login Handler
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      let authProvider;
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        case 'github':
          authProvider = new GithubAuthProvider();
          break;
        case 'microsoft':
          authProvider = new OAuthProvider('microsoft.com');
          break;
        default:
          throw new Error('Invalid provider');
      }

      // Perform social login
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      // Check if user exists in Firestore, if not create a profile
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
          role: 'user'
        });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Social login error:', error);
      setError(
        error.code === 'auth/popup-closed-by-user' ? 'Login cancelled' :
        error.code === 'auth/account-exists-with-different-credential' 
          ? 'Account exists with different credential' :
        'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 3
        }}
      >
        {/* Brand and Title */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}>
          <Avatar 
            sx={{ 
              m: 1, 
              bgcolor: 'primary.main', 
              width: 56, 
              height: 56 
            }}
          >
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Weather IoT Dashboard
          </Typography>
          <Chip 
            label="Secure Login" 
            color="primary" 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1 }} 
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleEmailLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl 
            variant="outlined" 
            fullWidth 
            margin="normal"
            required
          >
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          {/* Social Login Divider */}
          <Divider sx={{ my: 2 }}>
            <Chip label="OR" size="small" />
          </Divider>

          {/* Social Login Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                sx={{ 
                  color: '#db4437', 
                  borderColor: '#db4437',
                  '&:hover': {
                    bgcolor: 'rgba(219, 68, 55, 0.04)'
                  }
                }}
              >
                Google
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                sx={{ 
                  color: '#333', 
                  borderColor: '#333',
                  '&:hover': {
                    bgcolor: 'rgba(51, 51, 51, 0.04)'
                  }
                }}
              >
                GitHub
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MicrosoftIcon />}
                onClick={() => handleSocialLogin('microsoft')}
                disabled={loading}
                sx={{ 
                  color: '#00a4ef', 
                  borderColor: '#00a4ef',
                  '&:hover': {
                    bgcolor: 'rgba(0, 164, 239, 0.04)'
                  }
                }}
              >
                Microsoft
              </Button>
            </Grid>
          </Grid>

          {/* Additional Links */}
          <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
            <Grid item>
              <Link 
                href="#" 
                variant="body2" 
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link 
                href="#" 
                variant="body2" 
                onClick={() => navigate('/register')}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;