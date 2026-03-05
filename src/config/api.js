import axios from "axios";
export const BASE_URL =
  "https://lunular-vernia-inexcusably.ngrok-free.dev/hod-panel/api";
export const postRequest = async (endpoint, data = {}, headers = {}) => {
  try {
    console.log("--------------------------------------------------");
    console.log("POST Request:", `${BASE_URL}/${endpoint}`);
    console.log("Payload:", data);

    const response = await axios.post(`${BASE_URL}/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      timeout: 15000,
    });

    console.log("POST Response:", response.data);
    console.log("--------------------------------------------------");

    return response.data;
  } catch (error) {
    console.log("--------------------------------------------------");

    if (error.response) {
      console.error("Server Error:", error.response.status);
      console.error("Response:", error.response.data);
    } else if (error.request) {
      console.error("Network Error: No response from server");
    } else {
      console.error("Error:", error.message);
    }

    console.log("--------------------------------------------------");

    return null;
  }
};

export const getRequest = async (endpoint, headers = {}) => {
  try {
    console.log("--------------------------------------------------");
    console.log("GET Request:", `${BASE_URL}/${endpoint}`);

    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      headers: {
        Accept: "application/json",
        ...headers,
      },
      timeout: 15000,
    });

    console.log("GET Response:", response.data);
    console.log("--------------------------------------------------");

    return response.data;
  } catch (error) {
    console.log("--------------------------------------------------");

    if (error.response) {
      console.error("Server Error:", error.response.status);
      console.error("Response:", error.response.data);
    } else if (error.request) {
      console.error("Network Error: No response from server");
    } else {
      console.error("Error:", error.message);
    }

    console.log("--------------------------------------------------");

    return null;
  }
};