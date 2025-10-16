const DYNAMIC_API_URL = import.meta.env.VITE_API_URL;

// File size limit (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const sendMessage = async (message, pdfContent = '', sessionId = 'default') => {
  try {
    const response = await fetch(`${DYNAMIC_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, pdf_content: pdfContent, session_id: sessionId }),
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

export const getChatHistory = async (sessionId = 'default', limit = 50) => {
  try {
    const response = await fetch(`${DYNAMIC_API_URL}/history?session_id=${sessionId}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('History API Error:', error);
    return [];
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${DYNAMIC_API_URL}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Stats API Error:", error);
    throw error;
  }
};

export const trainModel = async () => {
  try {
    const response = await fetch(`${DYNAMIC_API_URL}/train`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Train API Error:", error);
    throw error;
  }
};

export const processPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${DYNAMIC_API_URL}/process-pdf`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("PDF Process API Error:", error);
    throw error;
  }
};

export const uploadPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${DYNAMIC_API_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("PDF Upload API Error:", error);
    throw error;
  }
};

export const resetConversation = async (sessionId = 'default') => {
  try {
    const response = await fetch(`${DYNAMIC_API_URL}/reset?session_id=${sessionId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Reset API Error:", error);
    throw error;
  }
};
