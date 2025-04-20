// src/components/WeatherMetricCard.jsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip,
  alpha,
  useTheme,
  ButtonBase
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const WeatherMetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  secondaryValue, 
  secondaryLabel, 
  trend,
  onClick 
}) => {
  const theme = useTheme();
  
  // Get a lighter background color based on the provided color
  const getBgColor = () => {
    if (color === 'primary') return alpha(theme.palette.primary.main, 0.08);
    if (color === 'secondary') return alpha(theme.palette.secondary.main, 0.08);
    if (color === 'success') return alpha(theme.palette.success.main, 0.08);
    if (color === 'warning') return alpha(theme.palette.warning.main, 0.08);
    if (color === 'error') return alpha(theme.palette.error.main, 0.08);
    if (color === 'info') return alpha(theme.palette.info.main, 0.08);
    return alpha(theme.palette.primary.main, 0.08);
  };
  
  // Get color for the trend indicator
  const getTrendColor = () => {
    if (!trend) return 'inherit';
    return trend > 0 ? theme.palette.success.main : theme.palette.error.main;
  };
  
  return (
    <ButtonBase 
      sx={{ 
        display: 'block', 
        width: '100%', 
        textAlign: 'left',
        borderRadius: theme.shape.borderRadius * 2,
        '&:hover': {
          '& .MuiCard-root': {
            transform: 'translateY(-6px)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.12)',
          },
          '& .card-overlay': {
            opacity: 1
          }
        }
      }}
      onClick={onClick}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 160
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '40%', 
            height: '100%',
            background: `linear-gradient(135deg, transparent 30%, ${getBgColor()} 100%)`,
            zIndex: 0
          }} 
        />
        
        {/* Clickable overlay indicator */}
        <Box 
          className="card-overlay"
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0,
            padding: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
          }} 
        >
          <OpenInNewIcon fontSize="small" color="action" />
        </Box>
        
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Avatar 
              sx={{ 
                bgcolor: getBgColor(), 
                color: theme.palette[color].main,
                width: 36, 
                height: 36 
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', mr: 1 }}>
              {value}
            </Typography>
            <Typography variant="body1" component="span" color="text.secondary">
              {unit}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                {trend > 0 ? (
                  <ArrowUpIcon fontSize="small" sx={{ color: 'success.main' }} />
                ) : (
                  <ArrowDownIcon fontSize="small" sx={{ color: 'error.main' }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ color: getTrendColor(), fontWeight: 'medium' }}
                >
                  {Math.abs(trend).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          
          {secondaryValue && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {secondaryLabel}: {secondaryValue}
            </Typography>
          )}
        </CardContent>
      </Card>
    </ButtonBase>
  );
};

export default WeatherMetricCard;