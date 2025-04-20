// src/components/HistoricalData.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as HumidityIcon,
  Compress as PressureIcon,
  AirOutlined as WindIcon,
  WbSunny as LightIcon,
  WaterOutlined as RainIcon
} from '@mui/icons-material';
import weatherService from '../firebase/weatherService';

const HistoricalData = ({ data, allDevices, selectedDevice, onDeviceChange }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  
  // Define today's date for default end date
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  // Define available metrics
  const metrics = [
    { id: 'temperature', name: 'Temperature', unit: '°C', color: '#1976d2', icon: <ThermostatIcon /> },
    { id: 'humidity', name: 'Humidity', unit: '%', color: '#0288d1', icon: <HumidityIcon /> },
    { id: 'pressure', name: 'Pressure', unit: 'hPa', color: '#ed6c02', icon: <PressureIcon /> },
    { id: 'windSpeed', name: 'Wind Speed', unit: 'm/s', color: '#2e7d32', icon: <WindIcon /> },
    { id: 'light', name: 'Light Intensity', unit: 'lux', color: '#ffc107', icon: <LightIcon /> },
    { id: 'rain', name: 'Rain', unit: 'mm', color: '#0288d1', icon: <RainIcon /> }
  ];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format data for charts
  const formatDataForCharts = (sourceData) => {
    if (!sourceData || sourceData.length === 0) return [];
    
    // Sort the data by timestamp first
    const sortedData = [...sourceData].sort((a, b) => {
      if (!a.received_at || !b.received_at) return 0;
      return new Date(a.received_at) - new Date(b.received_at);
    });
    
    // Group data by day or hour based on the time range
    const groupedData = {};
    let format = 'hour'; // Default format
    
    if (timeRange === 'month') {
      format = 'day';
    } else if (timeRange === 'week') {
      format = 'day';
    } else if (timeRange === 'custom' && 
              new Date(endDate) - new Date(startDate) > 7 * 24 * 60 * 60 * 1000) {
      format = 'day';
    }
    
    sortedData.forEach(item => {
      const date = new Date(item.received_at);
      let key;
      
      if (format === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        // Format as YYYY-MM-DD HH:00 for hourly
        key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          time: format === 'day' ? key : date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
          date: date.toLocaleDateString(),
          fullDate: date,
          readings: 0,
          temperature: 0,
          humidity: 0,
          pressure: 0,
          windSpeed: 0,
          windDirection: 0,
          windGust: 0,
          light: 0,
          rain: 0,
          uv: 0
        };
      }
      
      const payload = item.uplink_message?.decoded_payload || {};
      
      // Accumulate values for averaging
      groupedData[key].readings += 1;
      groupedData[key].temperature += payload.air_temperature || 0;
      groupedData[key].humidity += payload.air_humidity || 0;
      groupedData[key].pressure += payload.barometric_pressure ? payload.barometric_pressure / 100 : 0; // Convert to hPa
      groupedData[key].windSpeed += payload.wind_speed || 0;
      groupedData[key].windDirection += payload.wind_direction_sensor || 0;
      groupedData[key].windGust += payload.peak_wind_gust || 0;
      groupedData[key].light += payload.light_intensity || 0;
      groupedData[key].rain += payload.rain_accumulation || 0;
      groupedData[key].uv += payload.uv_index || 0;
    });
    
    // Convert groupedData to array and calculate averages
    const formattedData = Object.values(groupedData).map(group => {
      if (group.readings > 0) {
        group.temperature = group.temperature / group.readings;
        group.humidity = group.humidity / group.readings;
        group.pressure = group.pressure / group.readings;
        group.windSpeed = group.windSpeed / group.readings;
        group.windDirection = group.windDirection / group.readings;
        group.windGust = group.windGust / group.readings;
        group.light = group.light / group.readings;
        // Rain is cumulative, so we don't average it
        group.uv = group.uv / group.readings;
      }
      return group;
    });
    
    // Sort by date
    return formattedData.sort((a, b) => a.fullDate - b.fullDate);
  };
  
  // Process data based on time range
  const processDataByTimeRange = () => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    let filteredData = [...data];
    const now = new Date();
    let startDateTime;
    
    if (timeRange === 'day') {
      // Last 24 hours
      startDateTime = new Date(now);
      startDateTime.setHours(now.getHours() - 24);
    } else if (timeRange === 'week') {
      // Last 7 days
      startDateTime = new Date(now);
      startDateTime.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      // Last 30 days
      startDateTime = new Date(now);
      startDateTime.setDate(now.getDate() - 30);
    } else if (timeRange === 'custom') {
      // Custom date range
      if (startDate && endDate) {
        startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59);
        
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.received_at);
          return itemDate >= startDateTime && itemDate <= endDateTime;
        });
      }
    }
    
    // Filter by date range if not custom
    if (timeRange !== 'custom') {
      filteredData = filteredData.filter(item => {
        return new Date(item.received_at) >= startDateTime;
      });
    }
    
    // Filter by device if needed
    if (selectedDevice !== 'all') {
      filteredData = filteredData.filter(item => 
        item.end_device_ids?.device_id === selectedDevice
      );
    }
    
    const formattedData = formatDataForCharts(filteredData);
    setChartData(formattedData);
  };
  
  // Reset date range inputs
  const resetDateRange = () => {
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(formattedToday);
  };
  
  // Effect to process data when timeRange changes
  useEffect(() => {
    if (timeRange === 'custom') {
      if (!startDate || !endDate) {
        resetDateRange();
        return;
      }
    }
    
    processDataByTimeRange();
  }, [timeRange, data, selectedDevice, startDate, endDate]);
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    
    // This would usually fetch new data, but for this component we'll just reprocess
    processDataByTimeRange();
    
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };
  
  // Handle metric change
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };
  
  // Handle date range apply
  const handleApplyDateRange = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }
    
    setError(null);
    setTimeRange('custom');
    processDataByTimeRange();
  };
  
  // Download data as CSV
  const handleDownloadCSV = () => {
    if (chartData.length === 0) return;
    
    const headers = ['Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Wind Speed (m/s)', 'Rain (mm)'];
    const csvContent = chartData.map(item => {
      return [
        item.date,
        item.time,
        item.temperature.toFixed(1),
        item.humidity.toFixed(0),
        item.pressure.toFixed(1),
        item.windSpeed.toFixed(1),
        item.rain.toFixed(2)
      ].join(',');
    });
    
    const csv = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weather_data_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Get chart color based on metric
  const getMetricColor = (metricId) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.color : '#1976d2';
  };
  
  // Get chart unit based on metric
  const getMetricUnit = (metricId) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.unit : '';
  };
  
  // Render different chart types
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="text.secondary">
            No data available for the selected time range
          </Typography>
        </Box>
      );
    }
    
    // Determine chart type based on tab
    if (tabValue === 0) {
      // Line chart for time series
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#999999"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              stroke="#999999"
              label={{ 
                value: `${metrics.find(m => m.id === selectedMetric)?.name} (${getMetricUnit(selectedMetric)})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: getMetricColor(selectedMetric) }
              }}
            />
            <RechartsTooltip
              contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
              formatter={(value, name) => {
                return [`${value.toFixed(1)} ${getMetricUnit(selectedMetric)}`, metrics.find(m => m.id === selectedMetric)?.name];
              }}
              labelFormatter={(label) => `${chartData.find(item => item.time === label)?.date} ${label}`}
            />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              name={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={2}
              dot={{ r: 3, fill: getMetricColor(selectedMetric) }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (tabValue === 1) {
      // Bar chart for comparison
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#999999"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              stroke="#999999"
              label={{ 
                value: `${metrics.find(m => m.id === selectedMetric)?.name} (${getMetricUnit(selectedMetric)})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: getMetricColor(selectedMetric) }
              }}
            />
            <RechartsTooltip
              contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
              formatter={(value, name) => {
                return [`${value.toFixed(1)} ${getMetricUnit(selectedMetric)}`, metrics.find(m => m.id === selectedMetric)?.name];
              }}
              labelFormatter={(label) => `${chartData.find(item => item.time === label)?.date} ${label}`}
            />
            <Bar
              dataKey={selectedMetric}
              name={selectedMetric}
              fill={getMetricColor(selectedMetric)}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      // Area chart for distribution
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#999999"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              stroke="#999999"
              label={{ 
                value: `${metrics.find(m => m.id === selectedMetric)?.name} (${getMetricUnit(selectedMetric)})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: getMetricColor(selectedMetric) }
              }}
            />
            <RechartsTooltip
              contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
              formatter={(value, name) => {
                return [`${value.toFixed(1)} ${getMetricUnit(selectedMetric)}`, metrics.find(m => m.id === selectedMetric)?.name];
              }}
              labelFormatter={(label) => `${chartData.find(item => item.time === label)?.date} ${label}`}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              name={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              fill={`${getMetricColor(selectedMetric)}40`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (!chartData || chartData.length === 0) {
      return { 
        min: 'N/A', 
        max: 'N/A', 
        avg: 'N/A', 
        current: 'N/A' 
      };
    }
    
    const values = chartData.map(item => item[selectedMetric]).filter(val => val !== undefined && val !== null);
    
    if (values.length === 0) {
      return { 
        min: 'N/A', 
        max: 'N/A', 
        avg: 'N/A', 
        current: 'N/A' 
      };
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
    const current = values[values.length - 1]; // Most recent value
    
    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
      current: current.toFixed(1)
    };
  };
  
  // Get the stats
  const stats = calculateStats();
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              Historical Data Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and analyze historical weather data trends
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Download data as CSV">
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleDownloadCSV}
                disabled={chartData.length === 0}
                sx={{ ml: 1 }}
              >
                Export
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <ButtonGroup size="small" aria-label="time range filter">
              <Button 
                variant={timeRange === 'day' ? 'contained' : 'outlined'} 
                onClick={() => handleTimeRangeChange('day')}
              >
                24 Hours
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
              <Button 
                variant={timeRange === 'custom' ? 'contained' : 'outlined'}
                onClick={() => handleTimeRangeChange('custom')}
                startIcon={<DateRangeIcon />}
              >
                Custom
              </Button>
            </ButtonGroup>
          </Grid>
          
          {/* Device selector */}
          <Grid item xs={6} md={3}>
            {allDevices && allDevices.length > 1 && onDeviceChange && (
              <FormControl size="small" fullWidth>
                <InputLabel id="device-select-label">Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  value={selectedDevice}
                  label="Device"
                  onChange={onDeviceChange}
                >
                  <MenuItem value="all">All Devices</MenuItem>
                  {allDevices.map(device => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name || device.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="metric-select-label">Metric</InputLabel>
              <Select
                labelId="metric-select-label"
                value={selectedMetric}
                label="Metric"
                onChange={(e) => handleMetricChange(e.target.value)}
              >
                {metrics.map(metric => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Grid>
          
          {/* Custom date range inputs */}
          {timeRange === 'custom' && (
            <Grid item xs={12}>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: formattedToday }}
                  size="small"
                />
                <Button 
                  variant="contained" 
                  onClick={handleApplyDateRange}
                  size="small"
                >
                  Apply
                </Button>
                {error && (
                  <Alert severity="error" sx={{ mt: 1, flexGrow: 1 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Statistics Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Current
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.current} {getMetricUnit(selectedMetric)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Average
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.avg} {getMetricUnit(selectedMetric)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Minimum
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.min} {getMetricUnit(selectedMetric)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Maximum
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.max} {getMetricUnit(selectedMetric)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Chart Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="chart type tabs">
            <Tab label="Line Chart" />
            <Tab label="Bar Chart" />
            <Tab label="Area Chart" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {/* Current metric info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              color: 'white', 
              bgcolor: getMetricColor(selectedMetric), 
              p: 0.8, 
              borderRadius: '50%',
              display: 'flex',
              mr: 1 
            }}>
              {metrics.find(m => m.id === selectedMetric)?.icon}
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {metrics.find(m => m.id === selectedMetric)?.name} {getMetricUnit(selectedMetric)}
            </Typography>
          </Box>
          
          {/* Chart */}
          <Box sx={{ height: 400, mt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              renderChart()
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Data info */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Data Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {chartData.length > 0 ? (
            <>
              Showing {chartData.length} data points from {chartData[0]?.date} to {chartData[chartData.length - 1]?.date}.
              {selectedDevice !== 'all' ? ` Filtered to device ${selectedDevice}.` : ' Showing data from all devices.'}
            </>
          ) : (
            'No data available for the selected criteria.'
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default HistoricalData;