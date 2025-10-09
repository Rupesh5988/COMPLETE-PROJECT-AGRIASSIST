// Path: src/ai/flows/fertilizer-recommendation.js

import axios from "axios";

// This function calls your working `/get_environmental_data` endpoint
export async function getEnvironmentalData(lat, lon) {
  try {
    const url = "http://127.0.0.1:5002/get_environmental_data";
    const response = await axios.post(url, { lat, lon });
    return response.data;
  } catch (error) {
    console.error("Error fetching environmental data:", error);
    throw new Error("Failed to fetch environmental data.");
  }
}

// This function calls your working `/predict` endpoint
export async function getFertilizerPrediction(finalPayload) {
  try {
    const url = "http://127.0.0.1:5002/predict";
    const response = await axios.post(url, finalPayload);
    return {
      recommendations: response.data.prediction,
    };
  } catch (error) {
    console.error("Error getting prediction:", error);
    throw new Error("Failed to get fertilizer prediction.");
  }
}