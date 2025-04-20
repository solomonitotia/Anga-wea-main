// src/components/SettingsPanel.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Avatar,
  Slider,
  InputAdornment,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as HumidityIcon,
  Compress as PressureIcon,
  AirOutlined as WindIcon,
  WaterOutlined as RainIcon,
  Person as PersonIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  DataUsage as DataUsageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const SettingsPanel = () => {
  const { currentUser, userData } = useAuth();
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: currentUser?.email || '',
    phone: userData?.phone || ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    alertThreshold: {
      temperature: 30,
      humidity: 85,
      pressure: 980,
      windSpeed: 15,
      rain: 10
    }
  });
  
  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    temperatureUnit: 'celsius',
    windSpeedUnit: 'ms',
    timeFormat: '24h',
    dateFormat: 'mmddyyyy',
    theme: 'light',
    refreshRate: 5
  });
  
  // Advanced settings
  const [advancedSettings, setAdvancedSettings] = useState({
    dataRetention: 90,
    apiKey: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    debugMode: false
  });
  
  // State for expanded panels
  const [expanded, setExpanded] = useState({
    profile: true,
    notifications: false,
    display: false,
    advanced: false
  });
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle panel expansion
  const handleExpandPanel = (panel) => {
    setExpanded({
      ...expanded,
      [panel]: !expanded[panel]
    });
  };
  
  // Handle profile settings change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings({
      ...profileSettings,
      [name]: value
    });
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  // Handle alert threshold change
  const handleThresholdChange = (metric, value) => {
    setNotificationSettings({
      ...notificationSettings,
      alertThreshold: {
        ...notificationSettings.alertThreshold,
        [metric]: value
      }
    });
  };
  
  // Handle display settings change
  const handleDisplayChange = (setting, value) => {
    setDisplaySettings({
      ...displaySettings,
      [setting]: value
    });
  };
  
  // Handle advanced settings change
  const handleAdvancedChange = (setting, value) => {
    setAdvancedSettings({
      ...advancedSettings,
      [setting]: value
    });
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to Firebase
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your dashboard and notification preferences
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              }
              title="Profile Settings"
              action={
                <IconButton onClick={() => handleExpandPanel('profile')}>
                  {expanded.profile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            />
            <Collapse in={expanded.profile} timeout="auto" unmountOnExit>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profileSettings.firstName}
                      onChange={handleProfileChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profileSettings.lastName}
                      onChange={handleProfileChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profileSettings.email}
                      onChange={handleProfileChange}
                      margin="normal"
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profileSettings.phone}
                      onChange={handleProfileChange}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <NotificationsIcon />
                </Avatar>
              }
              title="Notification Settings"
              action={
                <IconButton onClick={() => handleExpandPanel('notifications')}>
                  {expanded.notifications ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            />
            <Collapse in={expanded.notifications} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Notification Methods
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.email}
                          onChange={() => handleNotificationToggle('email')}
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.push}
                          onChange={() => handleNotificationToggle('push')}
                          color="primary"
                        />
                      }
                      label="Push Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.sms}
                          onChange={() => handleNotificationToggle('sms')}
                          color="primary"
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                  Alert Thresholds
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ThermostatIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>Temperature</Typography>
                    </Box>
                    <Slider
                      value={notificationSettings.alertThreshold.temperature}
                      onChange={(e, value) => handleThresholdChange('temperature', value)}
                      valueLabelDisplay="auto"
                      min={-20}
                      max={50}
                      marks={[
                        { value: -20, label: '-20°C' },
                        { value: 0, label: '0°C' },
                        { value: 25, label: '25°C' },
                        { value: 50, label: '50°C' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Alert when temperature exceeds {notificationSettings.alertThreshold.temperature}°C
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HumidityIcon color="info" sx={{ mr: 1 }} />
                      <Typography>Humidity</Typography>
                    </Box>
                    <Slider
                      value={notificationSettings.alertThreshold.humidity}
                      onChange={(e, value) => handleThresholdChange('humidity', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Alert when humidity exceeds {notificationSettings.alertThreshold.humidity}%
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WindIcon color="success" sx={{ mr: 1 }} />
                      <Typography>Wind Speed</Typography>
                    </Box>
                    <Slider
                      value={notificationSettings.alertThreshold.windSpeed}
                      onChange={(e, value) => handleThresholdChange('windSpeed', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={50}
                      marks={[
                        { value: 0, label: '0 m/s' },
                        { value: 25, label: '25 m/s' },
                        { value: 50, label: '50 m/s' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Alert when wind speed exceeds {notificationSettings.alertThreshold.windSpeed} m/s
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RainIcon color="info" sx={{ mr: 1 }} />
                      <Typography>Rain</Typography>
                    </Box>
                    <Slider
                      value={notificationSettings.alertThreshold.rain}
                      onChange={(e, value) => handleThresholdChange('rain', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={50}
                      marks={[
                        { value: 0, label: '0 mm' },
                        { value: 25, label: '25 mm' },
                        { value: 50, label: '50 mm' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Alert when rain accumulation exceeds {notificationSettings.alertThreshold.rain} mm
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
        
        {/* Display Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LanguageIcon />
                </Avatar>
              }
              title="Display Settings"
              action={
                <IconButton onClick={() => handleExpandPanel('display')}>
                  {expanded.display ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            />
            <Collapse in={expanded.display} timeout="auto" unmountOnExit>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="temperature-unit-label">Temperature Unit</InputLabel>
                      <Select
                        labelId="temperature-unit-label"
                        value={displaySettings.temperatureUnit}
                        label="Temperature Unit"
                        onChange={(e) => handleDisplayChange('temperatureUnit', e.target.value)}
                      >
                        <MenuItem value="celsius">Celsius (°C)</MenuItem>
                        <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="wind-speed-unit-label">Wind Speed Unit</InputLabel>
                      <Select
                        labelId="wind-speed-unit-label"
                        value={displaySettings.windSpeedUnit}
                        label="Wind Speed Unit"
                        onChange={(e) => handleDisplayChange('windSpeedUnit', e.target.value)}
                      >
                        <MenuItem value="ms">Meters per second (m/s)</MenuItem>
                        <MenuItem value="kmh">Kilometers per hour (km/h)</MenuItem>
                        <MenuItem value="mph">Miles per hour (mph)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="time-format-label">Time Format</InputLabel>
                      <Select
                        labelId="time-format-label"
                        value={displaySettings.timeFormat}
                        label="Time Format"
                        onChange={(e) => handleDisplayChange('timeFormat', e.target.value)}
                      >
                        <MenuItem value="24h">24-hour (14:30)</MenuItem>
                        <MenuItem value="12h">12-hour (2:30 PM)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="theme-label">Theme</InputLabel>
                      <Select
                        labelId="theme-label"
                        value={displaySettings.theme}
                        label="Theme"
                        onChange={(e) => handleDisplayChange('theme', e.target.value)}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography gutterBottom>Dashboard Refresh Rate</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RefreshIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Slider
                        value={displaySettings.refreshRate}
                        onChange={(e, value) => handleDisplayChange('refreshRate', value)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={30}
                        sx={{ flexGrow: 1, mx: 2 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {displaySettings.refreshRate} {displaySettings.refreshRate === 1 ? 'minute' : 'minutes'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
        
        {/* Advanced Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <SecurityIcon />
                </Avatar>
              }
              title="Advanced Settings"
              action={
                <IconButton onClick={() => handleExpandPanel('advanced')}>
                  {expanded.advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            />
            <Collapse in={expanded.advanced} timeout="auto" unmountOnExit>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Data Retention Period</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DataUsageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Slider
                        value={advancedSettings.dataRetention}
                        onChange={(e, value) => handleAdvancedChange('dataRetention', value)}
                        valueLabelDisplay="auto"
                        step={30}
                        marks={[
                          { value: 30, label: '30 days' },
                          { value: 90, label: '90 days' },
                          { value: 180, label: '180 days' },
                          { value: 365, label: '365 days' }
                        ]}
                        min={30}
                        max={365}
                        sx={{ flexGrow: 1, mx: 2 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        {advancedSettings.dataRetention} days
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Historical data will be stored for this period of time
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={advancedSettings.apiKey}
                      onChange={(e) => handleAdvancedChange('apiKey', e.target.value)}
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button size="small" variant="outlined">
                              Regenerate
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Use this API key to access your weather data programmatically"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedSettings.debugMode}
                          onChange={() => handleAdvancedChange('debugMode', !advancedSettings.debugMode)}
                          color="primary"
                        />
                      }
                      label="Debug Mode"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Enable debug mode for additional logging and troubleshooting
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>
      
      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Save Settings
        </Button>
      </Box>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPanel;