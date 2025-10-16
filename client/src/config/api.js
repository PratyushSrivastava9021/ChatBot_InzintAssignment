const API_BASE_URL = "http://localhost:8000/api";

export const sendMessage = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Stats API Error:", error);
    throw error;
  }
};

export const trainModel = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/train`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Train API Error:", error);
    throw error;
  }
};
