// src/components/WeatherStationOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  WaterDrop as HumidityIcon,
  Compress as PressureIcon,
  AirOutlined as WindIcon,
  WbSunny as LightIcon,
  WaterOutlined as RainIcon,
  BrightnessLow as UVIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  SignalCellular4Bar as SignalIcon,
  DataUsage as DataIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

// Import custom components
import WeatherMetricCard from './WeatherMetricCard';
import WeatherMetricDetail from './WeatherMetricDetail';

// Import centralized device status utility
import deviceStatusUtils from '../utils/deviceStatus';

// Custom styled components
const GlassPanel = styled(Box)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #64b5f6)'
  },
}));

const WeatherStationOverview = ({
  stations,
  loading,
  lastUpdated,
  selectedDevice = 'all',
  allDevices = [],
  onDeviceChange
}) => {
  const [timeRange, setTimeRange] = useState('day');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const [localStations, setLocalStations] = useState([]);

  // State for metric detail dialog
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    metric: null,
    title: '',
    value: '',
    unit: '',
    icon: null,
    color: 'primary',
    trend: null
  });

  // Initialize local stations when stations prop changes
  useEffect(() => {
    if (stations && stations.length > 0) {
      setLocalStations(stations);
    }
  }, [stations]);

  // Auto-refresh the data periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // In a real app, you'd fetch fresh data here
      // For this implementation, we'll just refresh the local state
      if (localStations && localStations.length > 0) {
        setLocalStations([...localStations]);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [localStations]);

  // Debug log the received stations data
  useEffect(() => {
    console.log("WeatherStationOverview received stations:", stations);

    if (stations && stations.length > 0) {
      const sample = stations[0];
      console.log("Sample station data:", sample);

      // Log the important parts of the data structure
      console.log("Received at:", sample.received_at);
      console.log("Device ID:", sample.end_device_ids?.device_id);
      console.log("Payload data:", sample.uplink_message?.decoded_payload);
    }
  }, [stations]);

  // Format data for charts based on time range
  const formatDataForCharts = (stations) => {
    if (!stations || stations.length === 0) return [];

    console.log("Formatting chart data from stations:", stations.length);

    // Filter data based on time range
    const now = new Date();
    let filteredStations = [...stations];

    if (timeRange === 'day') {
      // Last 24 hours
      const oneDayAgo = new Date(now);
      oneDayAgo.setHours(now.getHours() - 24);
      filteredStations = stations.filter(station =>
        new Date(station.received_at) >= oneDayAgo
      );
    } else if (timeRange === 'week') {
      // Last 7 days
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filteredStations = stations.filter(station =>
        new Date(station.received_at) >= oneWeekAgo
      );
    } else if (timeRange === 'month') {
      // Last 30 days
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setDate(now.getDate() - 30);
      filteredStations = stations.filter(station =>
        new Date(station.received_at) >= oneMonthAgo
      );
    }

    return filteredStations.map(station => {
      // Extract the timestamp and format it
      try {
        const date = new Date(station.received_at);
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Extract weather metrics from the uplink_message.decoded_payload
        const payload = station.uplink_message?.decoded_payload || {};

        return {
          time: formattedTime,
          date: date.toLocaleDateString(),
          temperature: payload.air_temperature,
          humidity: payload.air_humidity,
          pressure: payload.barometric_pressure ? payload.barometric_pressure / 100 : null, // Convert to hPa
          light: payload.light_intensity,
          windSpeed: payload.wind_speed,
          windDirection: payload.wind_direction_sensor,
          windGust: payload.peak_wind_gust,
          rain: payload.rain_accumulation,
          uv: payload.uv_index,
          timestamp: date.getTime()
        };
      } catch (error) {
        console.error("Error formatting data point:", error, station);
        return null;
      }
    })
      .filter(item => item !== null) // Remove any items that failed to format
      // Sort by timestamp
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // Get the latest station data 
  const getLatestStationData = (stations) => {
    if (!stations || stations.length === 0) {
      console.warn("No stations data available");
      return null;
    }

    // Sort by timestamp (descending) and get the most recent entry
    try {
      const sorted = [...stations].sort((a, b) => {
        if (!a.received_at || !b.received_at) return 0;
        const dateA = new Date(a.received_at);
        const dateB = new Date(b.received_at);
        return dateB - dateA;
      });

      console.log("Latest station data:", sorted[0]);
      return sorted[0];
    } catch (error) {
      console.error("Error getting latest station data:", error);
      return stations[0]; // Fallback to first item if sorting fails
    }
  };

  // Format values with error handling
  const formatValue = (value, unit = '', decimals = 1) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return `${value.toFixed(decimals)}${unit}`;
    return `${value}${unit}`;
  };

  // Calculate trend (percentage change from previous day)
  const calculateTrend = (current, previous) => {
    if (current === null || previous === null || previous === 0) return undefined;
    return ((current - previous) / previous) * 100;
  };

  // Get 24hr ago data point for trend calculation
  const get24HrAgoData = (stations, metric) => {
    if (!stations || stations.length < 2) return null;

    // Get current time
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(yesterday.getHours() - 24);

    // Find closest data point to 24 hours ago
    const sorted = [...stations].sort((a, b) => {
      const timeA = new Date(a.received_at);
      const timeB = new Date(b.received_at);

      const diffA = Math.abs(timeA - yesterday);
      const diffB = Math.abs(timeB - yesterday);

      return diffA - diffB;
    });

    // Return the payload value
    if (sorted.length > 0 && sorted[0].uplink_message?.decoded_payload) {
      const payload = sorted[0].uplink_message.decoded_payload;

      switch (metric) {
        case 'temperature': return payload.air_temperature;
        case 'humidity': return payload.air_humidity;
        case 'pressure': return payload.barometric_pressure ? payload.barometric_pressure / 100 : null;
        case 'windSpeed': return payload.wind_speed;
        case 'light': return payload.light_intensity;
        case 'rain': return payload.rain_accumulation;
        case 'uv': return payload.uv_index;
        default: return null;
      }
    }

    return null;
  };

  // Refresh data
  const handleRefresh = () => {
    setLocalLoading(true);
    // Here you would typically fetch fresh data
    // For now, we just simulate a refresh with a timeout
    setTimeout(() => {
      setLocalLoading(false);
    }, 1000);
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLocalLoading(true);
    setTimeout(() => {
      setLocalLoading(false);
    }, 500);
  };

  // Handle opening metric detail dialog
  const handleOpenMetricDetail = (metric, title, value, unit, icon, color, trend) => {
    setDetailDialog({
      open: true,
      metric,
      title,
      value,
      unit,
      icon,
      color,
      trend
    });
  };

  // Handle closing metric detail dialog
  const handleCloseMetricDetail = () => {
    setDetailDialog({
      ...detailDialog,
      open: false
    });
  };

  // Use the centralized device status utility
  const getDeviceStatus = (device) => {
    // Pass the entire device object rather than just the timestamp
    return deviceStatusUtils.getDeviceStatus(device, { 
      // For demo, you can force online - remove in production
      // forceOnline: true
    });
  };

  // Get the formatted charts data
  const chartsData = formatDataForCharts(stations);

  // Get the latest station data for current metrics
  const latestStation = getLatestStationData(stations);
  const latestPayload = latestStation?.uplink_message?.decoded_payload || {};

  // Get the current device name
  const getCurrentDeviceName = () => {
    if (selectedDevice === 'all') return 'All Devices';
    const device = allDevices.find(d => d.id === selectedDevice);
    return device ? (device.name || device.id) : selectedDevice;
  };

  // Get status for device
  const deviceStatus = latestStation ? getDeviceStatus(latestStation.received_at) : { label: 'Unknown', color: 'default' };

  // If there's no data or loading
  if (loading || localLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Loading Weather Data...
        </Typography>
      </Box>
    );
  }

  // If there's an error
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // If there's no station data
  if (!latestStation) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          background: `linear-gradient(45deg, ${alpha(theme.palette.warning.light, 0.1)}, ${alpha(theme.palette.warning.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
        }}
      >
        <InfoIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Weather Data Available
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          No weather station data was found in the database. Please make sure your IoT devices are properly connected and sending data.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={localLoading}
        >
          {localLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Paper>
    );
  }

  // Get previous data for trend calculation
  const prevTemp = get24HrAgoData(stations, 'temperature');
  const prevHumidity = get24HrAgoData(stations, 'humidity');
  const prevPressure = get24HrAgoData(stations, 'pressure');
  const prevWindSpeed = get24HrAgoData(stations, 'windSpeed');
  const prevLight = get24HrAgoData(stations, 'light');
  const prevRain = get24HrAgoData(stations, 'rain');
  const prevUV = get24HrAgoData(stations, 'uv');

  // Calculate trends
  const tempTrend = calculateTrend(latestPayload.air_temperature, prevTemp);
  const humidityTrend = calculateTrend(latestPayload.air_humidity, prevHumidity);
  const pressureTrend = calculateTrend(
    latestPayload.barometric_pressure ? latestPayload.barometric_pressure / 100 : null,
    prevPressure
  );
  const windSpeedTrend = calculateTrend(latestPayload.wind_speed, prevWindSpeed);
  const lightTrend = calculateTrend(latestPayload.light_intensity, prevLight);
  const rainTrend = calculateTrend(latestPayload.rain_accumulation, prevRain);
  const uvTrend = calculateTrend(latestPayload.uv_index, prevUV);

  return (
    <Box>
      {/* Header with weather overview */}
      <GlassPanel sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '10%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  color: 'white',
                  mr: 2
                }}
              >
                <LocationIcon fontSize="large" />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h4" gutterBottom fontWeight="medium">
                    {getCurrentDeviceName()}
                  </Typography>
                  <Chip
                    label={deviceStatus.label}
                    size="small"
                    color={deviceStatus.color}
                    sx={{ ml: 1 }}
                  />
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  {selectedDevice === 'all' ? (
                    // All devices view
                    `Monitoring ${stations.length} readings from ${allDevices.length} stations`
                  ) : (
                    // Single device view
                    `Last updated: ${latestStation ? new Date(latestStation.received_at).toLocaleString() : 'N/A'}`
                  )}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {/* Optional device selector in the component */}
              {allDevices && allDevices.length > 1 && onDeviceChange && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="device-select-label">Select Device</InputLabel>
                  <Select
                    labelId="device-select-label"
                    value={selectedDevice}
                    label="Select Device"
                    onChange={onDeviceChange}
                  >
                    <MenuItem value="all">All Devices ({allDevices.length})</MenuItem>
                    {allDevices.map(device => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name || device.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <ButtonGroup size="small" aria-label="time range filter">
                <Button
                  variant={timeRange === 'day' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeRangeChange('day')}
                >
                  Day
                </Button>
                <Button
                  variant={timeRange === 'week' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeRangeChange('week')}
                >
                  Week
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeRangeChange('month')}
                >
                  Month
                </Button>
              </ButtonGroup>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={localLoading}>
                  {localLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </GlassPanel>

      {/* Current weather metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Current Conditions</Typography>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {/* Temperature */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Temperature"
              value={formatValue(latestPayload.air_temperature, '')}
              unit="°C"
              icon={<ThermostatIcon fontSize="small" sx={{ color: 'primary.main' }} />}
              color="primary"
              trend={tempTrend}
              onClick={() => handleOpenMetricDetail(
                'temperature',
                'Temperature',
                formatValue(latestPayload.air_temperature, ''),
                '°C',
                <ThermostatIcon />,
                'primary',
                tempTrend
              )}
            />
          </Grid>

          {/* Humidity */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Humidity"
              value={formatValue(latestPayload.air_humidity, '', 0)}
              unit="%"
              icon={<HumidityIcon fontSize="small" sx={{ color: 'info.main' }} />}
              color="info"
              trend={humidityTrend}
              onClick={() => handleOpenMetricDetail(
                'humidity',
                'Humidity',
                formatValue(latestPayload.air_humidity, '', 0),
                '%',
                <HumidityIcon />,
                'info',
                humidityTrend
              )}
            />
          </Grid>

          {/* Pressure */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Pressure"
              value={formatValue(latestPayload.barometric_pressure ? latestPayload.barometric_pressure / 100 : null, '')}
              unit="hPa"
              icon={<PressureIcon fontSize="small" sx={{ color: 'warning.main' }} />}
              color="warning"
              trend={pressureTrend}
              onClick={() => handleOpenMetricDetail(
                'pressure',
                'Pressure',
                formatValue(latestPayload.barometric_pressure ? latestPayload.barometric_pressure / 100 : null, ''),
                'hPa',
                <PressureIcon />,
                'warning',
                pressureTrend
              )}
            />
          </Grid>

          {/* Wind */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Wind"
              value={formatValue(latestPayload.wind_speed, '')}
              unit="m/s"
              icon={<WindIcon fontSize="small" sx={{ color: 'success.main' }} />}
              color="success"
              secondaryValue={`${formatValue(latestPayload.wind_direction_sensor, '°', 0)} | ${formatValue(latestPayload.peak_wind_gust, ' m/s')}`}
              secondaryLabel="Direction | Gust"
              trend={windSpeedTrend}
              onClick={() => handleOpenMetricDetail(
                'windSpeed',
                'Wind Speed',
                formatValue(latestPayload.wind_speed, ''),
                'm/s',
                <WindIcon />,
                'success',
                windSpeedTrend
              )}
            />
          </Grid>

          {/* Light Intensity */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Light Intensity"
              value={formatValue(latestPayload.light_intensity, '', 0)}
              unit="lux"
              icon={<LightIcon fontSize="small" sx={{ color: 'warning.main' }} />}
              color="warning"
              trend={lightTrend}
              onClick={() => handleOpenMetricDetail(
                'light',
                'Light Intensity',
                formatValue(latestPayload.light_intensity, '', 0),
                'lux',
                <LightIcon />,
                'warning',
                lightTrend
              )}
            />
          </Grid>

          {/* Rain */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="Rain"
              value={formatValue(latestPayload.rain_accumulation, '', 2)}
              unit="mm"
              icon={<RainIcon fontSize="small" sx={{ color: 'info.main' }} />}
              color="info"
              secondaryValue={formatValue(latestPayload.rain_gauge, ' mm/h')}
              secondaryLabel="Current rate"
              trend={rainTrend}
              onClick={() => handleOpenMetricDetail(
                'rain',
                'Rain',
                formatValue(latestPayload.rain_accumulation, '', 2),
                'mm',
                <RainIcon />,
                'info',
                rainTrend
              )}
            />
          </Grid>

          {/* UV Index */}
          <Grid item xs={6} sm={4} md={2}>
            <WeatherMetricCard
              title="UV Index"
              value={formatValue(latestPayload.uv_index, '', 0)}
              unit=""
              icon={<UVIcon fontSize="small" sx={{ color: 'error.main' }} />}
              color="error"
              trend={uvTrend}
              onClick={() => handleOpenMetricDetail(
                'uv',
                'UV Index',
                formatValue(latestPayload.uv_index, '', 0),
                '',
                <UVIcon />,
                'error',
                uvTrend
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Weather Trends Section (charts will appear when we have data) */}
      {chartsData.length > 0 ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
            Weather Trends
          </Typography>

          {/* Temperature & Humidity Chart */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Temperature & Humidity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                  />
                  <YAxis
                    yAxisId="left"
                    tickCount={6}
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                    label={{
                      value: 'Temperature (°C)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette.primary.main, fontWeight: 500 }
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                    label={{
                      value: 'Humidity (%)',
                      angle: 90,
                      position: 'insideRight',
                      style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette.info.main, fontWeight: 500 }
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: alpha(theme.palette.background.paper, 0.9),
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                    formatter={(value, name) => {
                      if (name === 'temperature') return [`${value ? value.toFixed(1) : 'N/A'} °C`, 'Temperature'];
                      if (name === 'humidity') return [`${value || 'N/A'} %`, 'Humidity'];
                      return [value, name];
                    }}
                    labelStyle={{ color: alpha(theme.palette.text.primary, 0.7), fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="temperature"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.palette.primary.main }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    name="humidity"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.palette.info.main }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                    style={{ strokeDasharray: '5 5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Barometric Pressure Chart */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Barometric Pressure
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                    label={{
                      value: 'Pressure (hPa)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette.warning.main, fontWeight: 500 }
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: alpha(theme.palette.background.paper, 0.9),
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                    formatter={(value, name) => [`${value ? value.toFixed(1) : 'N/A'} hPa`, 'Pressure']}
                    labelStyle={{ color: alpha(theme.palette.text.primary, 0.7), fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pressure"
                    name="Pressure"
                    stroke={theme.palette.warning.main}
                    fill={alpha(theme.palette.warning.main, 0.1)}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.palette.warning.main }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                  <ReferenceLine
                    y={prevPressure || 1013}
                    stroke={alpha(theme.palette.warning.main, 0.5)}
                    strokeDasharray="3 3"
                    label={{
                      value: 'Previous day',
                      position: 'insideBottomLeft',
                      fill: alpha(theme.palette.text.secondary, 0.7),
                      fontSize: 10
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Wind & Rain Chart */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Wind Speed & Rain Accumulation
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                    label={{
                      value: 'Wind (m/s)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette.success.main, fontWeight: 500 }
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke={alpha(theme.palette.text.secondary, 0.4)}
                    label={{
                      value: 'Rain (mm)',
                      angle: 90,
                      position: 'insideRight',
                      style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette.info.main, fontWeight: 500 }
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: alpha(theme.palette.background.paper, 0.9),
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                    formatter={(value, name) => {
                      if (name === 'windSpeed') return [`${value ? value.toFixed(1) : '0'} m/s`, 'Wind Speed'];
                      if (name === 'windGust') return [`${value ? value.toFixed(1) : '0'} m/s`, 'Wind Gust'];
                      if (name === 'rain') return [`${value ? value.toFixed(2) : '0'} mm`, 'Rain'];
                      return [value, name];
                    }}
                    labelStyle={{ color: alpha(theme.palette.text.primary, 0.7), fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="windSpeed"
                    name="windSpeed"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.palette.success.main }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="windGust"
                    name="windGust"
                    stroke={alpha(theme.palette.success.light, 0.8)}
                    strokeWidth={2}
                    style={{ strokeDasharray: '5 5' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rain"
                    name="rain"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                    dot={{ r: 3, fill: theme.palette.info.main }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            mb: 4,
            background: `linear-gradient(45deg, ${alpha(theme.palette.warning.light, 0.1)}, ${alpha(theme.palette.warning.light, 0.05)})`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
          }}
        >
          <InfoIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Not Enough Data for Charts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There isn't enough historical data to display charts. Charts will appear once more data points are collected.
          </Typography>
        </Paper>
      )}

      {/* Device Information */}
      <Box>
        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
          Device Information
        </Typography>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          {latestStation && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 1.5,
                      width: 32,
                      height: 32
                    }}
                  >
                    <SignalIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Station Details
                  </Typography>
                </Box>

                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Device ID
                  </Typography>
                  <Typography variant="body1" gutterBottom fontWeight="medium">
                    {latestStation.end_device_ids?.device_id || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Device Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {latestStation.end_device_ids?.dev_addr || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Application ID
                  </Typography>
                  <Typography variant="body1">
                    {latestStation.end_device_ids?.application_ids?.application_id || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      mr: 1.5,
                      width: 32,
                      height: 32
                    }}
                  >
                    <DataIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Telemetry Data
                  </Typography>
                </Box>

                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Number of Readings
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {stations?.length || 0}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Signal Quality
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={`RSSI: ${latestStation.uplink_message?.rx_metadata?.[0]?.rssi || 'N/A'} dBm`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`SNR: ${latestStation.uplink_message?.rx_metadata?.[0]?.snr || 'N/A'} dB`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    First Reading
                  </Typography>
                  <Typography variant="body1">
                    {stations && stations.length > 0
                      ? new Date(stations[stations.length - 1].received_at).toLocaleString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Metric Detail Dialog */}
      <WeatherMetricDetail
        open={detailDialog.open}
        onClose={handleCloseMetricDetail}
        metric={detailDialog.metric}
        title={detailDialog.title}
        value={detailDialog.value}
        unit={detailDialog.unit}
        icon={detailDialog.icon}
        color={detailDialog.color}
        trend={detailDialog.trend}
        chartData={chartsData}
      />
    </Box>
  );
};

export default WeatherStationOverview;