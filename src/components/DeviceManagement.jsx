// src/components/DeviceManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  SignalCellular0Bar as SignalLowIcon,
  SignalCellular4Bar as SignalHighIcon,
  SignalCellularAlt as SignalMediumIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  DevicesOther as DevicesIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import weatherService from '../firebase/weatherService';

const DeviceManagement = ({ devices }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'
  const [deviceMenuAnchorEl, setDeviceMenuAnchorEl] = useState(null);
  const [selectedDeviceForMenu, setSelectedDeviceForMenu] = useState(null);

  // State for new device
  const [newDeviceData, setNewDeviceData] = useState({
    deviceId: '',
    applicationId: 'weather-stations',
    deviceAddress: '',
    deviceEui: '',
    joinEui: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  // Handle new device input change
  const handleNewDeviceChange = (e) => {
    const { name, value } = e.target;
    setNewDeviceData({
      ...newDeviceData,
      [name]: value
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  // Handle device menu
  const handleDeviceMenuOpen = (event, device) => {
    setDeviceMenuAnchorEl(event.currentTarget);
    setSelectedDeviceForMenu(device);
  };

  const handleDeviceMenuClose = () => {
    setDeviceMenuAnchorEl(null);
    setSelectedDeviceForMenu(null);
  };

  // Handle opening the add device dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  // Handle closing the add device dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form when dialog is closed
    setNewDeviceData({
      deviceId: '',
      applicationId: 'weather-stations',
      deviceAddress: '',
      deviceEui: '',
      joinEui: '',
      description: '',
      latitude: '',
      longitude: ''
    });
  };

  // Handle opening the delete device dialog
  const handleOpenDeleteDialog = (device) => {
    setSelectedDevice(device);
    setOpenDeleteDialog(true);
  };

  // Handle closing the delete device dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDevice(null);
  };

  // Extract location information from device data
  const getDeviceLocation = (device) => {
    // Check various possible locations in the device data
    const latitude = 
      device.latitude || 
      device.location?.latitude || 
      device.uplink_message?.decoded_payload?.latitude;
    
    const longitude = 
      device.longitude || 
      device.location?.longitude || 
      device.uplink_message?.decoded_payload?.longitude;
    
    // Return formatted location if both lat and long exist
    if (latitude && longitude) {
      return {
        latitude: Number(latitude).toFixed(4),
        longitude: Number(longitude).toFixed(4)
      };
    }
    
    return null;
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMinutes = Math.round((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (diffHours < 24) {
      return remainingMinutes > 0 
        ? `${diffHours}h ${remainingMinutes}m ago`
        : `${diffHours}h ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  // Calculate device status based on last activity
// Calculate device status based on last activity
const getDeviceStatus = (timestamp) => {
  if (!timestamp) return { label: 'Unknown', color: 'default' };

  const now = new Date();
  const lastActivity = new Date(timestamp);
  
  // Calculate time difference in minutes
  const diffMinutes = (now - lastActivity) / (1000 * 60);

  // Consider device online if data was sent within the last 60 minutes
  // This provides more granular control over online/offline status
  if (diffMinutes < 60) {
    return { 
      label: 'Online', 
      color: 'success',
      details: `Last active ${formatTimeAgo(lastActivity)}`
    };
  } 
  
  // If no data for more than 60 minutes, mark as offline
  return { 
    label: 'Offline', 
    color: 'error',
    details: `Last active ${formatTimeAgo(lastActivity)}`
  };
};

  // Deduplicate devices based on device_id
  const getUniqueDevices = () => {
    const uniqueDevices = new Map();

    if (!devices || devices.length === 0) return [];

    devices.forEach(device => {
      const deviceId = device.end_device_ids?.device_id;
      if (deviceId && !uniqueDevices.has(deviceId)) {
        uniqueDevices.set(deviceId, device);
      }
    });

    return Array.from(uniqueDevices.values());
  };

  // Get last reading data for a specific device
  const getLatestReading = (deviceId) => {
    if (!devices || devices.length === 0) return null;

    const deviceData = devices.filter(d => d.end_device_ids?.device_id === deviceId);

    if (deviceData.length === 0) return null;

    // Sort by timestamp (descending) and get most recent
    return deviceData.sort((a, b) => {
      if (!a.received_at || !b.received_at) return 0;
      const dateA = new Date(a.received_at);
      const dateB = new Date(b.received_at);
      return dateB - dateA;
    })[0];
  };

  // Handle adding a device
  const handleAddDevice = async () => {
    try {
      setLoading(true);

      // Validate input
      if (!newDeviceData.deviceId || !newDeviceData.applicationId) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      console.log('Adding device with data:', newDeviceData);

      // Add the device using our service
      const deviceId = await weatherService.addDevice(newDeviceData);

      console.log('Device added successfully with ID:', deviceId);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Device added successfully',
        severity: 'success'
      });

      // Reset the form
      setNewDeviceData({
        deviceId: '',
        applicationId: 'weather-stations',
        deviceAddress: '',
        deviceEui: '',
        joinEui: '',
        description: '',
        latitude: '',
        longitude: ''
      });

      // Close the dialog
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error adding device:', error);
      setSnackbar({
        open: true,
        message: `Error adding device: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a device
  const handleEditDevice = (device) => {
    // Initialize the edit form with the current device data
    setNewDeviceData({
      deviceId: device.end_device_ids?.device_id || '',
      applicationId: device.end_device_ids?.application_ids?.application_id || 'weather-stations',
      deviceAddress: device.end_device_ids?.dev_addr || '',
      deviceEui: device.end_device_ids?.dev_eui || '',
      joinEui: device.end_device_ids?.join_eui || '',
      description: device.description || '',
      latitude: device.location?.latitude || '',
      longitude: device.location?.longitude || ''
    });

    // Open the add/edit dialog
    setOpenAddDialog(true);
  };

  // Handle deleting a device
  const handleDeleteDevice = async () => {
    try {
      setLoading(true);

      // Delete the device using our service
      const deviceId = selectedDevice?.end_device_ids?.device_id;
      if (deviceId) {
        await weatherService.deleteDevice(deviceId);

        // Show success message
        setSnackbar({
          open: true,
          message: 'Device deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error('No device ID selected');
      }

      // Close the dialog
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting device:', error);
      setSnackbar({
        open: true,
        message: `Error deleting device: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get signal strength icon based on RSSI value
  const getSignalIcon = (rssi) => {
    if (!rssi) return <SignalLowIcon color="error" />;

    if (rssi > -80) return <SignalHighIcon color="success" />;
    if (rssi > -100) return <SignalMediumIcon color="warning" />;
    return <SignalLowIcon color="error" />;
  };

  // Render status filter chip
  const renderStatusFilterChip = () => {
    switch (statusFilter) {
      case 'online':
        return <Chip
          label="Online only"
          color="success"
          size="small"
          onDelete={() => handleStatusFilterChange('all')}
        />;
      case 'offline':
        return <Chip
          label="Offline only"
          color="error"
          size="small"
          onDelete={() => handleStatusFilterChange('all')}
        />;
      default:
        return null;
    }
  };

  // Get unique devices and filter them
  const uniqueDevices = getUniqueDevices();
  const filteredDevices = uniqueDevices.filter(device => {
    const deviceId = device.end_device_ids?.device_id || '';
    const appId = device.end_device_ids?.application_ids?.application_id || '';
    const devAddr = device.end_device_ids?.dev_addr || '';

    // Apply text search filter
    const matchesSearch =
      deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devAddr.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      const status = getDeviceStatus(device.received_at);
      return matchesSearch && status.label.toLowerCase() === statusFilter;
    }

    return matchesSearch;
  });

  // Render method
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{
        mb: 3,
        background: `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DevicesIcon
                sx={{
                  fontSize: 40,
                  mr: 2,
                  color: theme.palette.primary.main,
                  p: 1,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
              />
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="medium">
                  Device Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and monitor your IoT weather stations
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                fontWeight: 500,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Add Device
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<DevicesIcon />}
            iconPosition="start"
            label="All Devices"
          />
          <Tab
            icon={<TimelineIcon />}
            iconPosition="start"
            label="Performance"
          />
        </Tabs>
      </Box>

      {/* Search and filter controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {statusFilter !== 'all' && (
                <Box sx={{ mr: 2 }}>
                  {renderStatusFilterChip()}
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: 'inline' }}>
                {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="View as Grid">
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    size="small"
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View as List">
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    size="small"
                  >
                    <ListViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter devices">
                  <IconButton onClick={handleFilterClick} size="small">
                    <FilterIcon color={statusFilter !== 'all' ? 'primary' : 'default'} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                >
                  <MenuItem onClick={() => handleStatusFilterChange('all')}>
                    <Typography variant="body2">All Devices</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange('online')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label="Online"
                        size="small"
                        color="success"
                        sx={{ mr: 1, width: 70 }}
                      />
                      <Typography variant="body2">Online Devices</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange('offline')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label="Offline"
                        size="small"
                        color="error"
                        sx={{ mr: 1, width: 70 }}
                      />
                      <Typography variant="body2">Offline Devices</Typography>
                    </Box>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Device List/Grid View */}
      {viewMode === 'grid' ? (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => {
                const deviceId = device.end_device_ids?.device_id || 'Unknown Device';
                const appId = device.end_device_ids?.application_ids?.application_id || 'Unknown App';
                const devAddr = device.end_device_ids?.dev_addr || 'Unknown Address';

                // Get the latest reading for this device
                const latestReading = getLatestReading(deviceId);
                const rssi = latestReading?.uplink_message?.rx_metadata?.[0]?.rssi;
                const status = getDeviceStatus(device.received_at);
                const deviceLocation = getDeviceLocation(device);

                // Get reading count for this device
                const readingCount = devices.filter(d =>
                  d.end_device_ids?.device_id === deviceId
                ).length;

                return (
                  <Grid item xs={12} sm={6} md={4} key={deviceId}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
                        },
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          bgcolor: status.color + '.main'
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="div" noWrap fontWeight="medium">
                            {deviceId}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeviceMenuOpen(e, device)}
                            sx={{ ml: 1 }}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ fontWeight: 'medium', mr: 1 }}
                            title={status.details}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {appId}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Device Address
                            </Typography>
                            <Typography variant="body2" gutterBottom fontWeight="medium">
                              {devAddr}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Signal Strength
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getSignalIcon(rssi)}
                              <Typography variant="body2" sx={{ ml: 0.5 }} fontWeight="medium">
                                {rssi ? `${rssi} dBm` : 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Data Points
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {readingCount} readings
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {deviceLocation 
                                ? `${deviceLocation.latitude}°N, ${deviceLocation.longitude}°E`
                                : 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                        <Tooltip title="Edit device">
                          <IconButton
                            size="small"
                            onClick={() => handleEditDevice(device)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete device">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(device)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="h6">No devices found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Add a new device to get started'}
                  </Typography>
                  {!searchTerm && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={handleOpenAddDialog}
                    >
                      Add Device
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        // List View
        <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }} aria-label="devices table">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Signal</TableCell>
                <TableCell>Device Address</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Readings</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => {
                  const deviceId = device.end_device_ids?.device_id || 'Unknown Device';
                  const devAddr = device.end_device_ids?.dev_addr || 'Unknown Address';
                  const timestamp = device.received_at;

                  // Get the latest reading for this device
                  const latestReading = getLatestReading(deviceId);
                  const rssi = latestReading?.uplink_message?.rx_metadata?.[0]?.rssi;
                  const status = getDeviceStatus(timestamp);
                  const deviceLocation = getDeviceLocation(device);

                  // Get reading count for this device
                  const readingCount = devices.filter(d =>
                    d.end_device_ids?.device_id === deviceId
                  ).length;

                  return (
                    <TableRow
                      key={deviceId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        {deviceId}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                          title={status.details}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getSignalIcon(rssi)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {rssi ? `${rssi} dBm` : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{devAddr}</TableCell>
                      <TableCell>
                        {deviceLocation 
                          ? `${deviceLocation.latitude}°N, ${deviceLocation.longitude}°E`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatTimestamp(timestamp)}</TableCell>
                      <TableCell>{readingCount}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit device">
                          <IconButton
                            size="small"
                            onClick={() => handleEditDevice(device)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete device">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(device)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="h6">No devices found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm
                        ? 'Try adjusting your search criteria'
                        : 'Add a new device to get started'}
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ mt: 2 }}
                        onClick={handleOpenAddDialog}
                      >
                        Add Device
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Performance Tab */}
      {tabValue !== 0 && (
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Device Performance Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is coming soon. Stay tuned for performance analytics and insights.
          </Typography>
        </Paper>
      )}

      {/* Add Device Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DevicesIcon sx={{ mr: 1, color: 'primary.main' }} />
            Add New Weather Station
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details of the new weather station device to add it to your network.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Device ID"
                name="deviceId"
                value={newDeviceData.deviceId}
                onChange={handleNewDeviceChange}
                fullWidth
                required
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Application ID"
                name="applicationId"
                value={newDeviceData.applicationId}
                onChange={handleNewDeviceChange}
                fullWidth
                required
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Device Address"
                name="deviceAddress"
                value={newDeviceData.deviceAddress}
                onChange={handleNewDeviceChange}
                fullWidth
                required
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Device EUI"
                name="deviceEui"
                value={newDeviceData.deviceEui}
                onChange={handleNewDeviceChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Join EUI"
                name="joinEui"
                value={newDeviceData.joinEui}
                onChange={handleNewDeviceChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                name="latitude"
                value={newDeviceData.latitude}
                onChange={handleNewDeviceChange}
                fullWidth
                margin="dense"
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                name="longitude"
                value={newDeviceData.longitude}
                onChange={handleNewDeviceChange}
                fullWidth
                margin="dense"
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newDeviceData.description}
                onChange={handleNewDeviceChange}
                fullWidth
                multiline
                rows={2}
                margin="dense"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAddDialog}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddDevice}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Device'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Device Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the device
            {selectedDevice && (
              <strong>{` "${selectedDevice.end_device_ids?.device_id || 'Unknown Device'}"? `}</strong>
            )}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">Cancel</Button>
          <Button
            onClick={handleDeleteDevice}
            color="error"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Device Menu */}
      <Menu
        anchorEl={deviceMenuAnchorEl}
        open={Boolean(deviceMenuAnchorEl)}
        onClose={handleDeviceMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditDevice(selectedDeviceForMenu);
          handleDeviceMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Device
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenDeleteDialog(selectedDeviceForMenu);
            handleDeviceMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Device
        </MenuItem>
      </Menu>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default DeviceManagement;