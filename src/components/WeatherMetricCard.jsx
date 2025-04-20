// src/components/WeatherMetricCard.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
  alpha
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

const WeatherMetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color = 'primary', 
  trend,
  onClick 
}) => {
  const theme = useTheme();

  // Determine trend color and icon
  const trendColor = trend >= 0 ? theme.palette.success.main : theme.palette.error.main;
  const TrendIcon = trend >= 0 ? ArrowUpIcon : ArrowDownIcon;

  return (
    <Box 
      onClick={onClick}
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: '16px', // Slightly larger border radius
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)', // Enhanced shadow
        background: 'white',
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        padding: 3, // Increased padding
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Title section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 // Increased margin bottom
      }}>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}
        >
          {title}
        </Typography>
        
        {icon && (
          <Box 
            sx={{ 
              color: alpha(theme.palette[color].main, 0.7),
              fontSize: '1.5rem'
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {/* Main value section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        justifyContent: 'center',
        mb: 2, // Consistent margin
        flexGrow: 1
      }}>
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            lineHeight: 1,
            color: 'text.primary',
            mr: unit ? 0.5 : 0,
            fontSize: '2.5rem' // Larger font size
          }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: '1.25rem' // Larger unit size
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>

      {/* Trend indicator */}
      {trend !== undefined && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: trendColor
          }}
        >
          <TrendIcon 
            sx={{ 
              fontSize: 18, 
              mr: 0.5 
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: trendColor,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            {Math.abs(trend).toFixed(1)}% from yesterday
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WeatherMetricCard;