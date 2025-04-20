// src/firebase/weatherService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection name
const COLLECTION_NAME = 'weather-stations';

/**
 * Get the latest data from all weather stations
 * @param {number} limitCount - Number of records to return
 * @returns {Promise<Array>} - Array of weather station data
 */
export const getLatestWeatherData = async (limitCount = 10) => {
  try {
    const weatherQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('received_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(weatherQuery);
    const stationData = [];
    snapshot.forEach((doc) => {
      stationData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return stationData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Get data since a specific date
 * @param {Date} startDate - Date to fetch data from
 * @param {number} limitCount - Maximum number of records to return (optional)
 * @returns {Promise<Array>} - Array of weather station data
 */
export const getDataSinceDate = async (startDate, limitCount = 1000) => {
  try {
    console.log(`Fetching data since ${startDate.toISOString()}`);
    
    const dateQuery = query(
      collection(db, COLLECTION_NAME),
      where('received_at', '>=', startDate.toISOString()),
      orderBy('received_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(dateQuery);
    const stationData = [];
    snapshot.forEach((doc) => {
      stationData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Retrieved ${stationData.length} records since ${startDate.toISOString()}`);
    return stationData;
  } catch (error) {
    console.error(`Error fetching data since ${startDate.toISOString()}:`, error);
    throw error;
  }
};

/**
 * Get data for a specific device
 * @param {string} deviceId - The device ID to get data for
 * @param {number} limitCount - Number of records to return
 * @returns {Promise<Array>} - Array of weather station data for the device
 */
export const getDeviceData = async (deviceId, limitCount = 20) => {
  try {
    const deviceQuery = query(
      collection(db, COLLECTION_NAME),
      where('end_device_ids.device_id', '==', deviceId),
      orderBy('received_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(deviceQuery);
    const deviceData = [];
    snapshot.forEach((doc) => {
      deviceData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return deviceData;
  } catch (error) {
    console.error(`Error fetching data for device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Get historical data within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} deviceId - Optional device ID to filter by
 * @returns {Promise<Array>} - Array of weather station data
 */
export const getHistoricalData = async (startDate, endDate, deviceId = null) => {
  try {
    let historicalQuery;
    
    if (deviceId) {
      historicalQuery = query(
        collection(db, COLLECTION_NAME),
        where('end_device_ids.device_id', '==', deviceId),
        where('received_at', '>=', startDate.toISOString()),
        where('received_at', '<=', endDate.toISOString()),
        orderBy('received_at', 'asc')
      );
    } else {
      historicalQuery = query(
        collection(db, COLLECTION_NAME),
        where('received_at', '>=', startDate.toISOString()),
        where('received_at', '<=', endDate.toISOString()),
        orderBy('received_at', 'asc')
      );
    }
    
    const snapshot = await getDocs(historicalQuery);
    const historicalData = [];
    snapshot.forEach((doc) => {
      historicalData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return historicalData;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Get a list of all unique devices
 * @returns {Promise<Array>} - Array of device objects with id and name
 */
export const getAllDevices = async () => {
  try {
    // This is a simplified approach - in a real app you'd use a separate 'devices' collection
    const devicesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('received_at', 'desc')
    );
    
    const snapshot = await getDocs(devicesQuery);
    const devices = new Map();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const deviceId = data.end_device_ids?.device_id;
      
      if (deviceId && !devices.has(deviceId)) {
        devices.set(deviceId, {
          id: deviceId,
          name: `Weather Station ${deviceId.slice(-4)}`, // Use last 4 chars of ID as part of name
          address: data.end_device_ids?.dev_addr || 'Unknown',
          lastSeen: data.received_at,
          appId: data.end_device_ids?.application_ids?.application_id || 'Unknown'
        });
      }
    });
    
    return Array.from(devices.values());
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

/**
 * Add a new device with better error handling and logging
 * @param {Object} deviceData - Device data object
 * @returns {Promise<string>} - ID of the new device document
 */
export const addDevice = async (deviceData) => {
  try {
    console.log('Starting device addition process with data:', deviceData);
    
    // Validate required fields
    if (!deviceData.deviceId) {
      throw new Error('Device ID is required');
    }
    
    if (!deviceData.applicationId) {
      throw new Error('Application ID is required');
    }
    
    // Create the device data object
    const newDeviceData = {
      end_device_ids: {
        device_id: deviceData.deviceId,
        application_ids: {
          application_id: deviceData.applicationId
        },
        dev_addr: deviceData.deviceAddress || deviceData.deviceId,
        dev_eui: deviceData.deviceEui || '',
        join_eui: deviceData.joinEui || ''
      },
      received_at: new Date().toISOString(),
      uplink_message: {
        decoded_payload: {
          air_temperature: 0,
          air_humidity: 0,
          barometric_pressure: 0,
          light_intensity: 0,
          wind_speed: 0,
          wind_direction_sensor: 0,
          peak_wind_gust: 0,
          rain_accumulation: 0,
          rain_gauge: 0,
          uv_index: 0,
          valid: true
        },
        f_cnt: 0,
        f_port: 3,
        frm_payload: "",
        rx_metadata: [{
          rssi: 0,
          snr: 0,
          timestamp: new Date().toISOString()
        }],
        packet_error_rate: 0
      },
      created_at: serverTimestamp(),
      description: deviceData.description || ""
    };
    
    console.log('Prepared device data:', newDeviceData);
    
    // Add to Firebase
    console.log('Adding to Firestore collection:', COLLECTION_NAME);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newDeviceData);
    console.log('Device added successfully, document ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error in addDevice function:', error);
    throw error;
  }
};

/**
 * Delete a device
 * @param {string} deviceId - Device ID to delete
 * @returns {Promise<void>}
 */
export const deleteDevice = async (deviceId) => {
  try {
    // In a real app with a separate 'devices' collection, you'd delete from there
    // For this demo, we'll delete the most recent entry for this device
    const deviceQuery = query(
      collection(db, COLLECTION_NAME),
      where('end_device_ids.device_id', '==', deviceId),
      orderBy('received_at', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(deviceQuery);
    if (!snapshot.empty) {
      await deleteDoc(doc(db, COLLECTION_NAME, snapshot.docs[0].id));
    } else {
      throw new Error(`Device ${deviceId} not found`);
    }
  } catch (error) {
    console.error(`Error deleting device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Process and format weather data for display
 * @param {Array} rawData - Raw weather data from Firebase
 * @returns {Array} - Processed data ready for charts and display
 */
export const processWeatherData = (rawData) => {
  return rawData.map(station => {
    // Extract the timestamp and format it
    const date = new Date(station.received_at);
    
    // Extract weather metrics from the uplink_message.decoded_payload
    const { 
      air_temperature,
      air_humidity,
      barometric_pressure,
      light_intensity,
      wind_speed,
      wind_direction_sensor,
      peak_wind_gust,
      rain_accumulation,
      uv_index
    } = station.uplink_message?.decoded_payload || {};
    
    return {
      timestamp: date.getTime(),
      deviceId: station.end_device_ids?.device_id,
      temperature: air_temperature,
      humidity: air_humidity,
      pressure: barometric_pressure ? barometric_pressure / 100 : null, // Convert to hPa
      light: light_intensity,
      windSpeed: wind_speed,
      windDirection: wind_direction_sensor,
      windGust: peak_wind_gust,
      rain: rain_accumulation,
      uv: uv_index,
      rssi: station.uplink_message?.rx_metadata?.[0]?.rssi,
      snr: station.uplink_message?.rx_metadata?.[0]?.snr,
      errorRate: station.uplink_message?.packet_error_rate
    };
  });
};

export default {
  getLatestWeatherData,
  getDeviceData,
  getHistoricalData,
  getAllDevices,
  getDataSinceDate,
  addDevice,
  deleteDevice,
  processWeatherData
};