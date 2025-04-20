
// src/firebase/config.js
// Updated Firebase configuration with proper error handling

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { 
  // Remove getFirestore if it's already imported elsewhere in this file
  enableIndexedDbPersistence, 
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";

// Your Firebase configuration - ensure these values are correct
const firebaseConfig = {
    apiKey: "AIzaSyCsIqZX5TyrLshb_mt0Zp0dDTMas-ShTr0",
    authDomain: "weather-data-marsabit.firebaseapp.com",
    databaseURL: "https://weather-data-marsabit-default-rtdb.firebaseio.com",
    projectId: "weather-data-marsabit",
    storageBucket: "weather-data-marsabit.firebasestorage.app",
    messagingSenderId: "377864797952",
    appId: "1:377864797952:web:ad5fe30fc75709e527fde5",
    measurementId: "G-C2LPRZBNT1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Realtime Database
const db = getDatabase(app);

// Export the initialized services
export { auth, db };