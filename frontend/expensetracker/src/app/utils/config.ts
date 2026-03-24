// src/app/utils/config.ts

// Determine the hostname of the server running the backend.
// In local development, if you access the app via an IP address (e.g., http://192.168.1.5:5173),
// the backend should also be accessed via that same IP address on port 5000.
// If accessing via localhost, it defaults to localhost.

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE_URL = `http://${hostname}:5000`;
export const FRONTEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:5173';
