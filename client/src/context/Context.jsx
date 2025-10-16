import React, { createContext, useState, useEffect } from 'react';
import { sendMessage, getChatHistory, resetConversation } from '../config/api';

export const Context = createContext();

// Utility function to decode HTML entities
const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
};

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [sessionId] = useState(() => {
        const stored = localStorage.getItem('prat_ai_session_id');
        if (stored) return stored;
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('prat_ai_session_id', newId);
        return newId;
    });
    const [chatHistory, setChatHistory] = useState([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const loadHistory = async () => {
        try {
            const history = await getChatHistory(sessionId);
            setChatHistory(history);
            if (history.length > 0) {
                const lastChat = history[history.length - 1];
                setRecentPrompt(lastChat.user_message);
                setResultData(lastChat.bot_response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('\n\n').map(p => p.trim() === '' ? '' : `<p>${p.replace(/\n/g, '<br/>')}</p>`).join(''));
                setShowResult(true);
            }
            setHistoryLoaded(true);
        } catch (error) {
            console.error('History load error:', error);
            setHistoryLoaded(true);
        }
    };

    useEffect(() => {
        if (!historyLoaded) {
            loadHistory();
        }
    }, [historyLoaded]);

    const onSent = async (prompt, pdfContent = '') => {
        setErrorMsg("");

        if (!prompt || prompt.trim() === "") {
            setErrorMsg("Please enter a valid message.");
            return;
        }

        // Clear input immediately
        setInput("");
        setResultData("");
        setLoading(true);
        setShowResult(true);
        setIsStreaming(true);

        setPrevPrompts(prev => [...prev, prompt]);
        setRecentPrompt(prompt);

        try {
            // Always try streaming first
            try {
                await streamMessage(prompt, sessionId);
            } catch (streamError) {
                console.log('Streaming failed, falling back to regular API:', streamError);
                // Fallback to regular API with simulated streaming
                const response = await sendMessage(prompt, pdfContent, sessionId);
                
                // Simulate streaming effect word by word
                const words = response.response.split(' ');
                let currentText = '';
                
                for (let i = 0; i < words.length; i++) {
                    currentText += words[i] + ' ';
                    const formatted = currentText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    setResultData(formatted);
                    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay per word
                }

                setChatHistory(prev => [...prev, {
                    user_message: prompt,
                    bot_response: response.response,
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error("Error in onSent:", error);
            setResultData("Unable to connect to Prat.AI server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
            setIsStreaming(false);
        }
    };

    const streamMessage = async (prompt, sessionId) => {
        try {
            console.log('[STREAM] Starting stream for:', prompt);
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
            const response = await fetch(`${baseUrl}/api/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: prompt,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6).trim();
                            if (jsonStr && jsonStr !== '[DONE]') {
                                try {
                                    // Decode HTML entities and clean up
                                    let cleanStr = decodeHtmlEntities(jsonStr);
                                    // Remove trailing newlines and extra characters
                                    cleanStr = cleanStr.replace(/\n+/g, '').trim();
                                    // Find the first complete JSON object
                                    const match = cleanStr.match(/^\{.*?\}/);
                                    if (match) {
                                        const data = JSON.parse(match[0]);
                                        
                                        if (data.content) {
                                            streamedContent += data.content;
                                            const formatted = streamedContent.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                                            setResultData(formatted);
                                        }
                                        
                                        if (data.done) {
                                            setChatHistory(prev => [...prev, {
                                                user_message: prompt,
                                                bot_response: streamedContent.trim(),
                                                timestamp: new Date().toISOString()
                                            }]);
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    // Skip malformed JSON
                                }
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            console.error('[STREAM] Error:', error);
            throw error;
        }
    };

    const loadPrompt = (prompt) => {
        const chat = chatHistory.find(c => c.user_message === prompt);
        if (chat) {
            setRecentPrompt(chat.user_message);
            const formattedResponse = chat.bot_response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('\n\n').map(p => p.trim() === '' ? '' : `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
            setResultData(formattedResponse);
            setShowResult(true);
        }
    }

    const newChat = () => {
        // Only clear UI state, keep database history
        setLoading(false);
        setShowResult(false);
        setRecentPrompt("");
        setInput("");
        setResultData("");
        setErrorMsg("");
        setIsStreaming(false);
        // Don't clear chatHistory - keep it for sidebar
    }

    const resetConversationHistory = async () => {
        try {
            await resetConversation(sessionId);
            setLoading(false);
            setShowResult(false);
            setRecentPrompt("");
            setInput("");
            setResultData("");
            setErrorMsg("");
            setChatHistory([]);
            setIsStreaming(false);
        } catch (error) {
            console.error('Reset error:', error);
            // Fallback to local reset
            setLoading(false);
            setShowResult(false);
            setRecentPrompt("");
            setInput("");
            setResultData("");
            setErrorMsg("");
            setChatHistory([]);
            setIsStreaming(false);
        }
    }

    const contextValue = {
        input,
        setInput,
        onSent,
        recentPrompt,
        prevPrompts,
        setRecentPrompt,
        loadPrompt,
        showResult,
        loading,
        resultData,
        errorMsg,
        newChat,
        showAbout,
        setShowAbout,
        sessionId,
        chatHistory,
        loadHistory,
        isStreaming,
        streamMessage,
        resetConversationHistory
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
