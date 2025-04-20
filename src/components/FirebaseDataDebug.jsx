// src/components/FirebaseDataDebug.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper,
  Typography, 
  Button, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  DataObject as DataObjectIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const FirebaseDataDebug = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [structureIssues, setStructureIssues] = useState([]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Check data structure
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const issues = [];
    
    // Check a sample record
    const sample = data[0];
    console.log("Checking data structure of:", sample);
    
    // Check for expected structure
    if (!sample.end_device_ids) {
      issues.push("Missing 'end_device_ids' object");
    } else {
      if (!sample.end_device_ids.device_id) issues.push("Missing 'end_device_ids.device_id'");
      if (!sample.end_device_ids.application_ids) issues.push("Missing 'end_device_ids.application_ids'");
    }
    
    if (!sample.received_at) {
      issues.push("Missing 'received_at' timestamp");
    }
    
    if (!sample.uplink_message) {
      issues.push("Missing 'uplink_message' object");
    } else {
      if (!sample.uplink_message.decoded_payload) {
        issues.push("Missing 'uplink_message.decoded_payload'");
      } else {
        const payload = sample.uplink_message.decoded_payload;
        
        // Check for expected weather metrics
        const expectedMetrics = [
          'air_temperature', 
          'air_humidity', 
          'barometric_pressure',
          'light_intensity',
          'wind_speed',
          'wind_direction_sensor',
          'rain_accumulation'
        ];
        
        const missingMetrics = expectedMetrics.filter(metric => 
          payload[metric] === undefined || payload[metric] === null
        );
        
        if (missingMetrics.length > 0) {
          issues.push(`Missing payload metrics: ${missingMetrics.join(', ')}`);
        }
      }
    }
    
    setStructureIssues(issues);
  }, [data]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  // Get counts of unique devices
  const getDeviceCounts = () => {
    if (!data || data.length === 0) return {};
    
    const devices = {};
    data.forEach(item => {
      const deviceId = item.end_device_ids?.device_id;
      if (deviceId) {
        devices[deviceId] = (devices[deviceId] || 0) + 1;
      }
    });
    
    return devices;
  };

  // Display a summary of the data
  const renderSummary = () => {
    if (!data || data.length === 0) return "No data available";

    const deviceCounts = getDeviceCounts();
    const deviceCount = Object.keys(deviceCounts).length;
    
    const latestTimestamp = data.reduce((latest, current) => {
      if (!current.received_at) return latest;
      const currentDate = new Date(current.received_at);
      return !latest || currentDate > latest ? currentDate : latest;
    }, null);

    return (
      <>
        <Typography variant="body1">
          Loaded {data.length} records from {deviceCount} device(s)
        </Typography>
        <Typography variant="body2">
          Latest data: {latestTimestamp ? formatTimestamp(latestTimestamp) : 'N/A'}
        </Typography>
        
        {Object.keys(deviceCounts).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Devices:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(deviceCounts).map(([deviceId, count]) => (
                <Chip 
                  key={deviceId}
                  label={`${deviceId} (${count})`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </>
    );
  };
  
  // Render a single document sample
  const renderSampleDocument = () => {
    if (!data || data.length === 0) return "No data available";
    
    const sample = data[0];
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Sample Document Structure:
        </Typography>
        <Box 
          sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2,
            borderRadius: 1,
            maxHeight: '200px',
            overflow: 'auto',
            '& pre': {
              m: 0,
              fontFamily: 'monospace',
              fontSize: 12
            }
          }}
        >
          <pre>{JSON.stringify(sample, null, 2)}</pre>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            <DataObjectIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Firebase Data Debug
          </Typography>
          {renderSummary()}
        </Box>
        <Chip 
          label={`${data?.length || 0} Records`} 
          color="info" 
          variant="outlined" 
        />
      </Box>
      
      {/* Structure validation */}
      {structureIssues.length > 0 ? (
        <Alert 
          severity="warning" 
          icon={<ErrorIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Data Structure Issues Detected:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {structureIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </Alert>
      ) : data && data.length > 0 ? (
        <Alert 
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2">
            Data structure looks valid for weather station data.
          </Typography>
        </Alert>
      ) : null}
      
      {/* Sample document */}
      {data && data.length > 0 && renderSampleDocument()}
      
      <Divider sx={{ my: 2 }} />

      {/* Full data accordion */}
      <Accordion expanded={expanded} onChange={handleToggle}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="firebase-data-content"
          id="firebase-data-header"
        >
          <Typography>
            <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Raw Firebase Data ({data?.length || 0} records)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box 
            sx={{ 
              maxHeight: '400px', 
              overflow: 'auto', 
              bgcolor: '#f5f5f5', 
              p: 2,
              borderRadius: 1,
              '& pre': {
                m: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: 12
              }
            }}
          >
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {!data || data.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          No data received from Firebase. Check your Firebase connection and make sure data exists in the collection.
        </Alert>
      ) : null}
    </Paper>
  );
};

export default FirebaseDataDebug;