// src/components/ModernWeatherCard.jsx - Light theme version
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar,
  useTheme
} from '@mui/material';

/**
 * A modern weather metric card component with a sleek design
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the weather metric (e.g., "Temperature")
 * @param {string|number} props.value - Main value to display
 * @param {string} props.unit - Unit of measurement (e.g., "°C")
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.color - MUI color to use (e.g., "primary", "warning")
 * @param {string} [props.secondaryValue] - Optional secondary value to display
 * @param {string} [props.secondaryLabel] - Label for the secondary value
 * @param {number} [props.trend] - Optional trend indicator (1 = up, -1 = down, 0 = stable)
 */
const ModernWeatherCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color = 'primary',
  secondaryValue, 
  secondaryLabel,
  trend 
}) => {
  const theme = useTheme();
  
  // Helper to determine if value is "N/A"
  const isValueNA = value === 'N/A';
  
  // Helper for trend icon
  const renderTrendIndicator = () => {
    if (trend === undefined) return null;
    
    if (trend > 0) {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: 'success.main', 
            fontSize: '1.2rem', 
            ml: 1, 
            fontWeight: 'bold' 
          }}
        >
          ↑
        </Typography>
      );
    } else if (trend < 0) {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: 'error.main', 
            fontSize: '1.2rem', 
            ml: 1, 
            fontWeight: 'bold' 
          }}
        >
          ↓
        </Typography>
      );
    } else {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: 'text.secondary', 
            fontSize: '1.2rem', 
            ml: 1 
          }}
        >
          →
        </Typography>
      );
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)'
        }
      }}
    >
      {/* Color accent on top of card */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(to right, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        }}
      />
      
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {title}
          </Typography>
          <Avatar 
            sx={{ 
              bgcolor: isValueNA ? 'rgba(0, 0, 0, 0.06)' : `${color}.main`,
              color: 'white',
              width: 40, 
              height: 40,
              boxShadow: isValueNA ? 'none' : `0 4px 14px rgba(${
                color === 'primary' ? '33, 150, 243' : 
                color === 'warning' ? '255, 152, 0' : 
                color === 'success' ? '76, 175, 80' : 
                color === 'error' ? '244, 67, 54' :
                '3, 169, 244'
              }, 0.2)`
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              fontSize: isValueNA ? '1.75rem' : '2.5rem',
              color: isValueNA ? 'text.disabled' : 'text.primary',
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            {value}
            {renderTrendIndicator()}
          </Typography>
          
          {!isValueNA && unit && (
            <Typography 
              component="span" 
              sx={{ 
                ml: 0.5,
                fontSize: '1.1rem',
                color: 'text.secondary',
                fontWeight: 500 
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>
        
        {secondaryValue && (
          <Box 
            sx={{ 
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {secondaryLabel}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary' 
              }}
            >
              {secondaryValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernWeatherCard;