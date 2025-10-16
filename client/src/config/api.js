const API_BASE_URL = "http://localhost:8000/api";

// File size limit (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const sendMessage = async (message, pdfContent = '', sessionId = 'default', conversationId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, pdf_content: pdfContent, session_id: sessionId, conversation_id: conversationId }),
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
    const response = await fetch(`${API_BASE_URL}/history?session_id=${sessionId}&limit=${limit}`);
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

export const processPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/process-pdf`, {
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
    
    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
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
export const sendMessageStream = async (message, pdfContent = '', sessionId = 'default', conversationId = null, onChunk, onComplete, onError) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, pdf_content: pdfContent, session_id: sessionId, conversation_id: conversationId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              onChunk(data.content, data.response_type);
            } else if (data.type === 'metadata') {
              onChunk('', '', data);
            } else if (data.type === 'complete') {
              onComplete(data.full_response, data.response_type, data.conversation_id);
            } else if (data.type === 'error') {
              onError(new Error(data.content));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Stream API Error:", error);
    onError(error);
  }
};