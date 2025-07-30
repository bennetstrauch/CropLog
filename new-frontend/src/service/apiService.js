import axios from "axios";
// apiService.js

// Create an Axios instance
const API = axios.create({
  baseURL: 'http://localhost:8080/api/',
});

// Use an interceptor to add the auth token to every request
API.interceptors.request.use((config) => {
  // Retrieve the token from local storage
  const token = localStorage.getItem('jwt_token');
  
  if (token) {
    // Add the token to the Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});


// --- Generic HTTP Methods ---
// You don't need to pass userId anymore. The backend gets it from the token.

export const get = async (endpoint) => {
  try {
    const response = await API.get(endpoint);
    console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET request error:", error.message);
    // Return a consistent error response or re-throw the error
    throw error;
  }
};

export const post = async (endpoint, data) => {
  try {
    const response = await API.post(endpoint, data);
    console.log("Response from POST:", response);
    return response.data;
  } catch (error) {
    console.error("POST request error:", error.message);
    throw error;
  }
};

// --- App-Specific API Calls ---

/**
 * Gets filtered harvest entries based on date range and optional crop IDs.
 * @param {object} dateRange - { startDate, endDate }
 * @param {Array<number>} [cropIds] - Optional array of crop IDs to filter by.
 * @returns {Promise<Array>}
 */
export async function getEntriesFilteredBy(dateRange, cropIds = []) {
  const { startDate, endDate } = dateRange;

  // Use URLSearchParams to easily build the query string
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  // Add each crop ID to the params
  if (cropIds && cropIds.length > 0) {
    cropIds.forEach(id => params.append('cropIds', id));
  }
  
  // Your backend endpoint is '/api/harvest-record/filtered'
  const endpoint = `harvest-record/filtered?${params.toString()}`;
  return get(endpoint);
}

// You'll also need auth-specific calls
export const loginUser = (credentials) => post('auth/login', credentials);
export const registerUser = (userData) => post('auth/register', userData);