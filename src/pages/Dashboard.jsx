// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Tooltip,
  CircularProgress,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Button,
  Badge,
  Chip,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DevicesOther as DevicesIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Code as CodeIcon,
  FilterList as FilterIcon,
  WbSunny,
  NightsStay as MoonIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  // ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import weatherService from '../firebase/weatherService';

// Import dashboard components
import {
  WeatherStationOverview,
  DeviceManagement,
  HistoricalData,
  SettingsPanel,
  FirebaseDataDebug
} from '../components';

const drawerWidth = 260;

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userData, signOut } = useAuth();

  // State for managing drawer in mobile view
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for managing the active dashboard section
  const [activeSection, setActiveSection] = useState('overview');

  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);

  // State for weather data
  const [weatherStations, setWeatherStations] = useState([]);
  const [allStations, setAllStations] = useState([]); // Store all stations
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('all'); // 'all' means show all devices
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // New state for notifications
  const [notificationCount, setNotificationCount] = useState(3);
  const [darkMode, setDarkMode] = useState(false);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle navigation
  const handleNavigation = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle device selection
  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);

    if (deviceId === 'all') {
      // Show all devices
      setWeatherStations(allStations);
    } else {
      // Filter to show only the selected device
      const filteredData = allStations.filter(station =>
        station.end_device_ids?.device_id === deviceId
      );
      setWeatherStations(filteredData);
    }
  };

  // Fetch weather station data from API
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        console.log("Fetching weather data ...");

        // Use our updated function to get data since April 17th
        const startDate = new Date('2025-04-17T00:00:00');

        try {
          // First try using our service method
          const stationData = await weatherService.getDataSinceDate(startDate);
          console.log("Data received from service:", stationData.length, "records");

          // Update last fetch time
          setLastUpdated(new Date());

          // Store all stations
          setAllStations(stationData);

          // Extract unique device IDs for the device selector
          const devices = [];
          const deviceIds = new Set();

          stationData.forEach(station => {
            const deviceId = station.end_device_ids?.device_id;
            const deviceName = station.end_device_ids?.dev_addr || deviceId;

            if (deviceId && !deviceIds.has(deviceId)) {
              deviceIds.add(deviceId);
              devices.push({
                id: deviceId,
                name: deviceName || deviceId
              });
            }
          });

          setAvailableDevices(devices);
          console.log("Available devices:", devices);

          // Apply current device filter
          if (selectedDeviceId && selectedDeviceId !== 'all') {
            const filteredData = stationData.filter(station =>
              station.end_device_ids?.device_id === selectedDeviceId
            );
            setWeatherStations(filteredData);
          } else {
            setWeatherStations(stationData);
          }

          return; // Exit early if successful
        } catch (serviceError) {
          console.error("Error using service method:", serviceError);
          // Continue to the API fetch as fallback
        }

        // Fallback to direct API fetch if service method fails
        const response = await fetch('https://weather-data-marsabit-default-rtdb.firebaseio.com/weather_data.json');

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received from API:", data);

        if (!data) {
          console.log("No data found");
          setWeatherStations([]);
          setAllStations([]);
          setLoading(false);
          return;
        }

        // Transform the data to match the format expected by components
        const stationData = [];

        // If data is an object with keys (common in Realtime DB)
        if (typeof data === 'object' && !Array.isArray(data)) {
          Object.keys(data).forEach(key => {
            const item = data[key];
            // Only include data since April 17
            const timestamp = item.received_at;
            if (timestamp && new Date(timestamp) >= startDate) {
              stationData.push({
                id: key,
                ...item
              });
            }
          });
        } else if (Array.isArray(data)) {
          // If data is an array
          data.filter(Boolean).forEach((item, index) => {
            // Only include data since April 17
            const timestamp = item.received_at;
            if (timestamp && new Date(timestamp) >= startDate) {
              stationData.push({
                id: item.id || `item-${index}`,
                ...item
              });
            }
          });
        }

        console.log("Processed weather data:", stationData);

        // Update last fetch time
        setLastUpdated(new Date());

        // Store all stations
        setAllStations(stationData);

        // Extract unique device IDs for the device selector
        const devices = [];
        const deviceIds = new Set();

        stationData.forEach(station => {
          const deviceId = station.end_device_ids?.device_id;
          const deviceName = station.end_device_ids?.dev_addr || deviceId;

          if (deviceId && !deviceIds.has(deviceId)) {
            deviceIds.add(deviceId);
            devices.push({
              id: deviceId,
              name: deviceName || deviceId
            });
          }
        });

        setAvailableDevices(devices);
        console.log("Available devices:", devices);

        // Apply current device filter
        if (selectedDeviceId && selectedDeviceId !== 'all') {
          const filteredData = stationData.filter(station =>
            station.end_device_ids?.device_id === selectedDeviceId
          );
          setWeatherStations(filteredData);
        } else {
          setWeatherStations(stationData);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError(`API fetch error: ${error.message}`);

        // Use fallback data
        const fallbackData = [
          {
            id: 'fallback-1',
            received_at: new Date().toISOString(),
            end_device_ids: {
              device_id: "202003536241300473",
              application_ids: {
                application_id: "weather-stations"
              },
              dev_addr: "Tiigo School Marsabit"
            },
            uplink_message: {
              decoded_payload: {
                air_temperature: 22.8,
                air_humidity: 93,
                barometric_pressure: 94470,
                light_intensity: 16787,
                wind_speed: 3.7,
                wind_direction_sensor: 120,
                peak_wind_gust: 5.7,
                rain_accumulation: 6.35,
                rain_gauge: 0,
                uv_index: 3,
                valid: true
              },
              f_cnt: 0,
              f_port: 1,
              rx_metadata: [{
                rssi: 0,
                snr: 0
              }],
              packet_error_rate: 0
            }
          }
        ];
        setWeatherStations(fallbackData);
        setAllStations(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchWeatherData();

    // Set up interval for polling (every 5 minutes)
    const intervalId = setInterval(fetchWeatherData, 500000);

    // Clean up the interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Navigation items
  const navItems = [
    {
      text: 'Overview',
      icon: <DashboardIcon />,
      section: 'overview',
      description: 'Current weather conditions from all stations'
    },
    {
      text: 'Device Management',
      icon: <DevicesIcon />,
      section: 'devices',
      description: 'Add, edit and configure weather stations'
    },
    {
      text: 'Historical Data',
      icon: <HistoryIcon />,
      section: 'history',
      description: 'View and analyze historical weather patterns'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      section: 'settings',
      description: 'Configure dashboard preferences'
    },
    {
      text: 'Debug',
      icon: <CodeIcon />,
      section: 'debug',
      description: 'System diagnostics and technical information'
    }
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Render the active dashboard section
  const renderDashboardSection = () => {
    if (error) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      );
    }

    switch (activeSection) {
      case 'devices':
        return <DeviceManagement devices={weatherStations} />;
      case 'history':
        return <HistoricalData data={weatherStations} allDevices={availableDevices} selectedDevice={selectedDeviceId} onDeviceChange={handleDeviceChange} />;
      case 'settings':
        return <SettingsPanel />;
      case 'debug':
        return <FirebaseDataDebug data={weatherStations} />;
      default:
        return <WeatherStationOverview
          stations={weatherStations}
          loading={loading}
          lastUpdated={lastUpdated}
          selectedDevice={selectedDeviceId}
          allDevices={availableDevices}
          onDeviceChange={handleDeviceChange}
        />;
    }
  };

  // Drawer content
  // Sidebar component within Dashboard.jsx
  {/* Drawer content */ }
  const drawer = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      {/* Branding Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2.5, 
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 40, 
            height: 40,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <WbSunny sx={{ color: 'white' }} />
        </Avatar>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Weather IoT
            </Typography>
            <Chip 
              label="2.0" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ 
                height: 20, 
                fontSize: '0.625rem',
                fontWeight: 600 
              }} 
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Dashboard Management
          </Typography>
        </Box>
      </Box>
  
      {/* Rest of the sidebar code remains the same as in the previous implementation */}
      {/* Navigation Items */}
      <List 
        component="nav" 
        sx={{ 
          flexGrow: 1, 
          px: 1, 
          py: 2 
        }}
      >
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.section)}
            selected={activeSection === item.section}
            sx={{
              borderRadius: 1.5,
              mx: 1,
              my: 0.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                },
                '& .MuiTypography-root': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: activeSection === item.section ? 'primary.main' : 'text.secondary',
                minWidth: 48,
                justifyContent: 'center'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.primary'
              }}
            />
          </ListItem>
        ))}
      </List>
  
      {/* Footer Section */}
      <Box 
        sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 2 
        }}
      >
        {/* Last Updated */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            px: 1
          }}
        >
          <RefreshIcon 
            sx={{ 
              mr: 1.5, 
              color: 'text.secondary', 
              fontSize: 18 
            }} 
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
          >
            Last Updated
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
          </Typography>
        </Box>
  
        {/* User Profile */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                mr: 2, 
                bgcolor: 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography 
                variant="body2" 
                fontWeight="600" 
                color="text.primary"
              >
                {currentUser?.displayName || currentUser?.email}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
              >
                {userData?.role || 'User'}
              </Typography>
            </Box>
          </Box>
  
          <Tooltip title="Logout">
            <IconButton 
              size="small" 
              color="primary"
              onClick={handleLogout}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          background: darkMode ? '#1e1e2d' : 'white',
          color: darkMode ? 'white' : 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {navItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Device Selector */}
            {availableDevices.length > 1 && (
              <Chip
                icon={<FilterIcon fontSize="small" />}
                label={selectedDeviceId === 'all'
                  ? 'All Devices'
                  : availableDevices.find(d => d.id === selectedDeviceId)?.name || selectedDeviceId
                }
                variant="outlined"
                sx={{
                  mr: 1,
                  '& .MuiChip-label': { fontSize: 13 }
                }}
                onClick={(event) => {
                  const select = document.createElement('select');
                  select.style.position = 'absolute';
                  select.style.left = '-9999px';
                  document.body.appendChild(select);

                  // Add options
                  const allOption = document.createElement('option');
                  allOption.value = 'all';
                  allOption.textContent = 'All Devices';
                  select.appendChild(allOption);

                  availableDevices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.id;
                    option.textContent = device.name || device.id;
                    select.appendChild(option);
                  });

                  // Set current value
                  select.value = selectedDeviceId;

                  // Add change handler
                  select.addEventListener('change', (e) => {
                    handleDeviceChange({ target: { value: e.target.value } });
                    document.body.removeChild(select);
                  });

                  // Show select dropdown
                  select.focus();
                  select.click();
                }}
              />
            )}

            {/* Mode toggle */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton
                color="inherit"
                onClick={toggleDarkMode}
                size="small"
                sx={{ mr: 1 }}
              >
                {darkMode ? <WbSunny /> : <MoonIcon />}
              </IconButton>
            </Tooltip>

            {/* Help button */}
            <Tooltip title="Help">
              <IconButton
                color="inherit"
                size="small"
                sx={{ mr: 1 }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            {/* Notification Icon */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                size="small"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account">
              <IconButton
                size="small"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer - responsive for mobile and desktop */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: darkMode ? '#1a1a27' : 'background.paper',
            color: darkMode ? 'rgba(255,255,255,0.85)' : 'inherit'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: darkMode ? '#151521' : '#f7f9fc',
          minHeight: '100vh',
          transition: 'background-color 0.3s ease'
        }}
      >
        <Toolbar /> {/* This provides spacing below the app bar */}

        {/* Page header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight="medium" color={darkMode ? 'white' : 'inherit'}>
              {navItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
            </Typography>
            <Typography
              variant="body2"
              color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'}
            >
              {navItems.find(item => item.section === activeSection)?.description || 'Weather IoT monitoring system'}
            </Typography>
          </Box>

          {/* Optional page-specific actions would go here */}
        </Box>

        {/* Show loader if data is still loading */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70vh',
              flexDirection: 'column'
            }}
          >
            <CircularProgress />
            <Typography
              variant="body2"
              sx={{ mt: 2 }}
              color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'}
            >
              Loading weather station data...
            </Typography>
          </Box>
        ) : (
          /* Dashboard Content */
          <Box>
            {renderDashboardSection()}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
