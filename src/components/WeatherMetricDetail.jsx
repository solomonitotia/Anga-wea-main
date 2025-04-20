// src/components/WeatherMetricDetail.jsx
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Typography, 
  Box, 
  Divider,
  Grid,
  Chip,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as HumidityIcon,
  Compress as PressureIcon,
  AirOutlined as WindIcon,
  WbSunny as LightIcon,
  WaterOutlined as RainIcon,
  BrightnessLow as UVIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
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
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

const WeatherMetricDetail = ({ 
  open, 
  onClose, 
  metric, 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  trend, 
  chartData,
  description 
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get metric data from chart data
  const getMetricData = () => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    
    return chartData.map(item => ({
      time: item.time,
      date: item.date,
      value: item[metric],
      timestamp: item.timestamp
    })).filter(item => item.value !== undefined && item.value !== null);
  };
  
  // Get statistics
  const getStatistics = () => {
    const data = getMetricData();
    if (data.length === 0) return { min: 'N/A', max: 'N/A', avg: 'N/A', current: 'N/A' };
    
    const values = data.map(item => item.value).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return { min: 'N/A', max: 'N/A', avg: 'N/A', current: 'N/A' };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return {
      min: isNaN(min) ? 'N/A' : min.toFixed(1),
      max: isNaN(max) ? 'N/A' : max.toFixed(1),
      avg: isNaN(avg) ? 'N/A' : avg.toFixed(1),
      current: value && !isNaN(value) ? value : 'N/A'
    };
  };
  
  const stats = getStatistics();
  const metricData = getMetricData();
  
  // Get proper icon for metric
  const getMetricIcon = () => {
    switch (metric) {
      case 'temperature': return <ThermostatIcon sx={{ fontSize: 24 }} />;
      case 'humidity': return <HumidityIcon sx={{ fontSize: 24 }} />;
      case 'pressure': return <PressureIcon sx={{ fontSize: 24 }} />;
      case 'windSpeed': return <WindIcon sx={{ fontSize: 24 }} />;
      case 'light': return <LightIcon sx={{ fontSize: 24 }} />;
      case 'rain': return <RainIcon sx={{ fontSize: 24 }} />;
      case 'uv': return <UVIcon sx={{ fontSize: 24 }} />;
      default: return <TimelineIcon sx={{ fontSize: 24 }} />;
    }
  };
  
  // Get proper description for metric
  const getMetricDescription = () => {
    if (description) return description;
    
    switch (metric) {
      case 'temperature':
        return 'Temperature indicates the ambient air temperature measured by the sensor in degrees Celsius. This measurement is taken at standard height and is calibrated for accuracy.';
      case 'humidity':
        return 'Humidity represents the amount of water vapor present in the air as a percentage. Higher values indicate more moisture in the air.';
      case 'pressure':
        return 'Barometric pressure is the pressure exerted by the weight of air in the atmosphere. It is measured in hectopascals (hPa) and can be used to predict weather changes.';
      case 'windSpeed':
        return 'Wind speed measures how fast the air is moving past the station in meters per second (m/s). This reading is an average over a short time period.';
      case 'light':
        return 'Light intensity shows the amount of light detected by the sensor, measured in lux. This gives an indication of sunlight strength at the station.';
      case 'rain':
        return 'Rain accumulation measures the total amount of rainfall collected by the sensor in millimeters (mm). The rate indicates the current intensity of rainfall.';
      case 'uv':
        return 'UV Index represents the strength of ultraviolet radiation from the sun. Higher values indicate greater risk of sun exposure and potential skin damage.';
      default:
        return 'Weather data collected from the IoT sensor network.';
    }
  };
  
  // Get unit label
  const getUnitLabel = () => {
    switch (metric) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'pressure': return 'hPa';
      case 'windSpeed': return 'm/s';
      case 'light': return 'lux';
      case 'rain': return 'mm';
      case 'uv': return '';
      default: return '';
    }
  };
  
  // Format value with null checking
  const formatValue = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return typeof val === 'string' ? val : val.toFixed(1);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette[color].light, 0.05)}, ${alpha(theme.palette[color].light, 0.01)})`,
        }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(theme.palette[color].main, 0.1), 
                color: theme.palette[color].main,
                mr: 1.5
              }}
            >
              {getMetricIcon()}
            </Avatar>
            <Typography variant="h6">{title} Details</Typography>
          </Box>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {/* Current value and stats */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette[color].main, 0.05),
                  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h2" fontWeight="medium">{value}</Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ ml: 1 }}>{unit}</Typography>
                </Box>
                {trend !== undefined && trend !== null && (
                  <Chip 
                    icon={trend >= 0 ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                    label={`${trend >= 0 ? '+' : ''}${isNaN(trend) ? '0.0' : trend.toFixed(1)}% from yesterday`}
                    color={trend >= 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  About {title}
                </Typography>
                <Typography variant="body2">
                  {getMetricDescription()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Statistical Summary */}
        <Typography variant="h6" gutterBottom>
          Statistical Summary
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current
              </Typography>
              <Typography variant="h5" color={color + '.main'} fontWeight="medium">
                {typeof stats.current === 'string' ? stats.current : formatValue(stats.current)} {stats.current !== 'N/A' ? getUnitLabel() : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average
              </Typography>
              <Typography variant="h5" fontWeight="medium">
                {stats.avg} {stats.avg !== 'N/A' ? getUnitLabel() : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Maximum
              </Typography>
              <Typography variant="h5" fontWeight="medium">
                {stats.max} {stats.max !== 'N/A' ? getUnitLabel() : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Minimum
              </Typography>
              <Typography variant="h5" fontWeight="medium">
                {stats.min} {stats.min !== 'N/A' ? getUnitLabel() : ''}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Data Visualization */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Historical Data
            </Typography>
            <Box>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab icon={<ShowChartIcon />} iconPosition="start" label="Line" />
                <Tab icon={<AreaChart />} iconPosition="start" label="Area" />
                <Tab icon={<BarChartIcon />} iconPosition="start" label="Bar" />
              </Tabs>
            </Box>
          </Box>
          
          <Box sx={{ height: 350, mt: 2 }}>
            {metricData && metricData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {tabValue === 0 ? (
                  <LineChart
                    data={metricData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      label={{ 
                        value: `${title} (${getUnitLabel()})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette[color].main, fontWeight: 500 }
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
                        return value === null || value === undefined ? 
                          ['N/A', title] : 
                          [`${value.toFixed(1)} ${getUnitLabel()}`, title];
                      }}
                      labelFormatter={(label) => `${metricData.find(item => item.time === label)?.date || ''} ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={title}
                      stroke={theme.palette[color].main}
                      strokeWidth={2}
                      dot={{ r: 3, fill: theme.palette[color].main }}
                      activeDot={{ r: 6, strokeWidth: 1 }}
                    />
                  </LineChart>
                ) : tabValue === 1 ? (
                  <AreaChart
                    data={metricData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      label={{ 
                        value: `${title} (${getUnitLabel()})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette[color].main, fontWeight: 500 }
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
                        return value === null || value === undefined ? 
                          ['N/A', title] : 
                          [`${value.toFixed(1)} ${getUnitLabel()}`, title];
                      }}
                      labelFormatter={(label) => `${metricData.find(item => item.time === label)?.date || ''} ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={title}
                      stroke={theme.palette[color].main}
                      fill={alpha(theme.palette[color].main, 0.1)}
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={metricData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      stroke={alpha(theme.palette.text.secondary, 0.4)}
                      label={{ 
                        value: `${title} (${getUnitLabel()})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12, fill: theme.palette[color].main, fontWeight: 500 }
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
                        return value === null || value === undefined ? 
                          ['N/A', title] : 
                          [`${value.toFixed(1)} ${getUnitLabel()}`, title];
                      }}
                      labelFormatter={(label) => `${metricData.find(item => item.time === label)?.date || ''} ${label}`}
                    />
                    <Bar
                      dataKey="value"
                      name={title}
                      fill={theme.palette[color].main}
                      barSize={20}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  No historical data available for this metric
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WeatherMetricDetail;