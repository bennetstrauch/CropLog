import axios from "axios";
import { triggerLogout } from "./authUtils";
// apiService.js

// Create an Axios instance
const API = axios.create({
  // baseURL: 'http://localhost:8080/api/',
  baseURL: "https://harvest-log.onrender.com/api/",
});

// Use an interceptor to add the auth token to every request
API.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage
    const token = localStorage.getItem("jwt_token");

    if (token) {
      // Add the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Check if the error is due to authentication issues
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("Authentication error detected, logging out...");
      // Trigger logout which will clear storage and redirect to login
      triggerLogout();
    }

    // Re-throw the error so it can still be handled by the calling code
    return Promise.reject(error);
  }
);

// --- Generic HTTP Methods ---
// You don't need to pass userId anymore. The backend gets it from the token.

export const get = async (endpoint) => {
  try {
    const response = await API.get(endpoint);
    console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET request error with endpoint: ", endpoint, "|", error.message);
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
    console.error("POST request error with endpoint: ", endpoint, "|", error.message);
    throw error;
  }
};

export const put = async (endpoint, data) => {
  try {
    const response = await API.put(endpoint, data);
    console.log("Response from PUT:", response);
    return response.data;
  } catch (error) {
    console.error("PUT request error with endpoint:", endpoint, "|", error.message);
    throw error;
  }
};

export const deleteRequest = async (endpoint, data) => {
  try {
    const response = await API.delete(endpoint, { data });
    console.log("Response from DELETE:", response);
    return response.data;
  } catch (error) {
    console.error("DELETE request error with endpoint:", endpoint, "|", error.message);
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
    cropIds.forEach((id) => params.append("cropIds", id));
  }

  // Your backend endpoint is '/api/harvest-record/filtered'
  const endpoint = `harvest-record/filtered?${params.toString()}`;
  return get(endpoint);
}

export async function getHarvestRecord(id) {
  return await get(`harvest-record/${id}`);
}

export async function getLatestHarvestRecord() {
  return await get("harvest-record/latest");
}

export async function postHarvestRecord(entry) {
  const response = await post("harvest-record", entry);
  return response.id;
}

export async function updateHarvestRecord(id, data) {
  return await put(`harvest-record/${id}`, data);
}

export async function deleteHarvestRecord(id) {
  return await deleteRequest(`harvest-record/${id}`);
}

export async function deleteHarvestRecords(ids) {
  return Promise.all(ids.map(id => deleteHarvestRecord(id)));
}



// You'll also need auth-specific calls
export const loginUser = (credentials) => post("auth/login", credentials);
export const registerUser = (userData) => post("auth/register", userData);
