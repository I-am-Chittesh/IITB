// config/ApiConfig.js

// --- CONFIGURATION: REPLACE THIS with your ESP32's actual IP Address ---
const ESP32_IP = '192.168.1.5'; 
// ------------------------------------------------------------------------

const BASE_URL = `http://${ESP32_IP}`;

export const RFID_URL = `${BASE_URL}/data`; // API for raw Tag ID from ESP32
export const AUTONOMOUS_URL = `${BASE_URL}/autonomous`; // API for AI Switch status

// The interval for how often the app polls the ESP32 (in milliseconds)
export const POLLING_INTERVAL = 2000; // 2 seconds