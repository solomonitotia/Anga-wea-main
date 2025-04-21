// src/utils/deviceStatus.js
/**
 * Utility functions for consistent device status calculation
 * across different components in the application
 */

/**
 * Format time ago in a human-readable format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time ago string
 */
export const formatTimeAgo = (date) => {
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
  
  /**
   * Find the most recent timestamp from device data
   * @param {Object} deviceData - The device data object
   * @returns {Date|null} - The most recent date or null if no valid timestamp found
   */
  export const findLatestTimestamp = (deviceData) => {
    if (!deviceData) return null;
  
    // For demo/testing purpose - force to current time
    // Remove this for production
    return new Date();
  
    // The code below would be used in production instead of the return above
    /*
    const timestamps = [];
  
    // Check received_at timestamp
    if (deviceData.received_at) {
      try {
        const receivedDate = new Date(deviceData.received_at);
        if (!isNaN(receivedDate.getTime())) {
          timestamps.push(receivedDate);
        }
      } catch (e) {
        console.warn("Invalid received_at date format", e);
      }
    }
  
    // Check RX metadata timestamp
    if (deviceData.uplink_message?.rx_metadata?.[0]?.timestamp) {
      try {
        const rxDate = new Date(deviceData.uplink_message.rx_metadata[0].timestamp);
        if (!isNaN(rxDate.getTime())) {
          timestamps.push(rxDate);
        }
      } catch (e) {
        console.warn("Invalid rx_metadata timestamp format", e);
      }
    }
  
    // Check join_accept_at timestamp
    if (deviceData.join_accept_at) {
      try {
        const joinDate = new Date(deviceData.join_accept_at);
        if (!isNaN(joinDate.getTime())) {
          timestamps.push(joinDate);
        }
      } catch (e) {
        console.warn("Invalid join_accept_at date format", e);
      }
    }
  
    // Check last_seen_at timestamp
    if (deviceData.last_seen_at) {
      try {
        const lastSeenDate = new Date(deviceData.last_seen_at);
        if (!isNaN(lastSeenDate.getTime())) {
          timestamps.push(lastSeenDate);
        }
      } catch (e) {
        console.warn("Invalid last_seen_at date format", e);
      }
    }
  
    // Check created_at timestamp
    if (deviceData.created_at) {
      try {
        const createdDate = new Date(deviceData.created_at);
        if (!isNaN(createdDate.getTime())) {
          timestamps.push(createdDate);
        }
      } catch (e) {
        console.warn("Invalid created_at date format", e);
      }
    }
  
    // Return most recent timestamp if we found any
    if (timestamps.length > 0) {
      return new Date(Math.max(...timestamps.map(date => date.getTime())));
    }
  
    return null;
    */
  };
  
  /**
   * Get a formatted timestamp for display
   * @param {Object} device - Device data
   * @returns {string} - Formatted timestamp string
   */
  export const getFormattedTimestamp = (device) => {
    // For demo/testing purposes - always return current time
    // Remove this in production
    const now = new Date();
    return now.toLocaleString();
  
    // The code below would be used in production
    /*
    const timestamp = findLatestTimestamp(device);
    if (!timestamp) return 'N/A';
    return timestamp.toLocaleString();
    */
  };
  
  /**
   * Determine device status based on last activity timestamp
   * This is the centralized function to use across all components
   * 
   * @param {Object} device - The device data object
   * @param {object} options - Optional configuration parameters
   * @param {number} options.onlineThresholdMinutes - Minutes threshold for online status (default: 30)
   * @returns {object} - Device status object with label, color and details
   */
  export const getDeviceStatus = (device, options = {}) => {
    // For demo/testing purpose - force to online
    // Remove this for production
    return { 
      label: 'Online', 
      color: 'success',
      details: 'Last active just now'
    };
  
    // The code below would be used in production instead of the return above
    /*
    // Find the latest timestamp from all available fields
    const latestTimestamp = findLatestTimestamp(device);
    
    if (!latestTimestamp) {
      return { 
        label: 'Unknown', 
        color: 'default',
        details: 'No timestamp available'
      };
    }
  
    const now = new Date();
    
    // Default online threshold is 30 minutes
    const onlineThreshold = options.onlineThresholdMinutes || 30;
    
    // Calculate time difference in minutes
    const diffMinutes = (now - latestTimestamp) / (1000 * 60);
  
    // Online if seen within threshold
    if (diffMinutes < onlineThreshold) {
      return { 
        label: 'Online', 
        color: 'success',
        details: `Last active ${formatTimeAgo(latestTimestamp)}`
      };
    }
    
    // Idle if seen within 3 hours
    if (diffMinutes < 180) {
      return { 
        label: 'Idle', 
        color: 'warning',
        details: `Last active ${formatTimeAgo(latestTimestamp)}`
      };
    }
    
    // Otherwise offline
    return { 
      label: 'Offline', 
      color: 'error',
      details: `Last active ${formatTimeAgo(latestTimestamp)}`
    };
    */
  };
  
  export default {
    getDeviceStatus,
    formatTimeAgo,
    findLatestTimestamp,
    getFormattedTimestamp
  };