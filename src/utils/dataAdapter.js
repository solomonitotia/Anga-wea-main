// src/utils/dataAdapter.js
// This utility helps convert different data formats to the structure expected by components

/**
 * Adapts data from various sources to the format expected by dashboard components
 * @param {Object|Array} rawData - The raw data from Firebase or API
 * @returns {Array} - Array of standardized weather station data objects
 */
export const adaptWeatherData = (rawData) => {
    if (!rawData) return [];
    
    console.log("Adapting raw data:", rawData);
    
    const result = [];
    
    // Handle object format (typical for Realtime DB)
    if (typeof rawData === 'object' && !Array.isArray(rawData)) {
      Object.keys(rawData).forEach(key => {
        const item = rawData[key];
        
        // Check if this is in weather station format or needs transformation
        if (item.end_device_ids && item.uplink_message) {
          // Already in expected format
          result.push({
            id: key,
            ...item
          });
        } else if (item.decoded_payload || item.temperature || item.humidity) {
          // Simple format with just weather metrics
          result.push({
            id: key,
            received_at: item.timestamp || item.time || new Date().toISOString(),
            end_device_ids: {
              device_id: item.device_id || `device-${key}`,
              application_ids: {
                application_id: item.application_id || "weather-stations"
              },
              dev_addr: item.device_addr || `device-${key}`
            },
            uplink_message: {
              decoded_payload: {
                air_temperature: item.temperature || item.air_temperature || 0,
                air_humidity: item.humidity || item.air_humidity || 0,
                barometric_pressure: item.pressure || item.barometric_pressure || 0,
                light_intensity: item.light || item.light_intensity || 0,
                wind_speed: item.wind_speed || 0,
                wind_direction_sensor: item.wind_direction || item.wind_direction_sensor || 0,
                peak_wind_gust: item.wind_gust || item.peak_wind_gust || 0,
                rain_accumulation: item.rain || item.rain_accumulation || 0,
                rain_gauge: item.rain_gauge || 0,
                uv_index: item.uv || item.uv_index || 0,
                valid: true
              },
              f_cnt: item.frame_counter || 0,
              rx_metadata: [{
                rssi: item.rssi || 0,
                snr: item.snr || 0
              }],
              packet_error_rate: item.error_rate || 0
            }
          });
        }
      });
    } else if (Array.isArray(rawData)) {
      // Handle array format
      rawData.forEach((item, index) => {
        if (!item) return; // Skip null/undefined items
        
        if (item.end_device_ids && item.uplink_message) {
          // Already in expected format
          result.push({
            id: item.id || `item-${index}`,
            ...item
          });
        } else if (item.decoded_payload || item.temperature || item.humidity) {
          // Simple format with just weather metrics
          result.push({
            id: item.id || `item-${index}`,
            received_at: item.timestamp || item.time || new Date().toISOString(),
            end_device_ids: {
              device_id: item.device_id || `device-${index}`,
              application_ids: {
                application_id: item.application_id || "weather-stations"
              },
              dev_addr: item.device_addr || `device-${index}`
            },
            uplink_message: {
              decoded_payload: {
                air_temperature: item.temperature || item.air_temperature || 0,
                air_humidity: item.humidity || item.air_humidity || 0,
                barometric_pressure: item.pressure || item.barometric_pressure || 0,
                light_intensity: item.light || item.light_intensity || 0,
                wind_speed: item.wind_speed || 0,
                wind_direction_sensor: item.wind_direction || item.wind_direction_sensor || 0,
                peak_wind_gust: item.wind_gust || item.peak_wind_gust || 0,
                rain_accumulation: item.rain || item.rain_accumulation || 0,
                rain_gauge: item.rain_gauge || 0,
                uv_index: item.uv || item.uv_index || 0,
                valid: true
              },
              f_cnt: item.frame_counter || 0,
              rx_metadata: [{
                rssi: item.rssi || 0,
                snr: item.snr || 0
              }],
              packet_error_rate: item.error_rate || 0
            }
          });
        }
      });
    }
    
    console.log("Adapted data:", result);
    return result;
  };