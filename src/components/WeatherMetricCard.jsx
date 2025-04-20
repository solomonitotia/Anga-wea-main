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
        borderRadius: '12px', // Specific border radius to match the image
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        background: 'white',
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* Top section with title and icon */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600,
            fontSize: '0.675rem'
          }}
        >
          {title}
        </Typography>
        
        {icon && (
          <Box 
            sx={{ 
              color: alpha(theme.palette[color].main, 0.7)
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
        mb: 1
      }}>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            lineHeight: 1,
            color: 'text.primary',
            mr: unit ? 0.5 : 0,
            fontSize: '2rem'
          }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography 
            variant="body2" 
            color="text.secondary"
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
              fontSize: 14, 
              mr: 0.5 
            }} 
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: trendColor,
              fontWeight: 500,
              fontSize: '0.675rem'
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