// src/components/WeatherMetricCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme,
  ButtonBase
} from '@mui/material';
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const WeatherMetricCard = ({
  title,
  value,
  unit,
  icon,
  color = 'primary',
  secondaryValue,
  secondaryLabel,
  trend,
  onClick
}) => {
  const theme = useTheme();

  const getBgColor = () => alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.08);
  const getTrendColor = () => trend > 0 ? theme.palette.success.main : theme.palette.error.main;

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        borderRadius: theme.shape.borderRadius * 2,
        '&:hover .MuiCard-root': {
          transform: 'translateY(-6px)',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.12)',
        },
        '&:hover .card-overlay': {
          opacity: 1,
        }
      }}
    >
      <Card
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: theme.shape.borderRadius * 2,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
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

        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            zIndex: 2
          }}
        >
          <OpenInNewIcon fontSize="small" color="action" />
        </Box>

        <CardContent sx={{ position: 'relative', zIndex: 2, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Avatar
              sx={{
                bgcolor: getBgColor(),
                color: theme.palette[color]?.main,
                width: 36,
                height: 36
              }}
            >
              {icon}
            </Avatar>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
