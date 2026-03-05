import axios from "axios";

export const BASE_URL = "https://lunular-vernia-inexcusably.ngrok-free.dev/hod-panel/api";

export const postRequest = async (endpoint, data = {}, headers = {}) => {
  try {
    console.log(`POST Request → ${BASE_URL}/${endpoint}`);
    console.log("Payload:", data);

    const response = await axios.post(`${BASE_URL}/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      timeout: 15000,
    });

    console.log(`Response from ${endpoint}:`, response.data);

    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.status, error.response.data);
      return null;
    } else if (error.request) {
      console.error("Network Error: No response from server.");
      return null;
    } else {
      console.error("Error:", error.message);
      return null;
    }
  }
};