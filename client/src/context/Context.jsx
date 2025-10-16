import React, { createContext, useState, useEffect } from 'react';
import { sendMessage, getChatHistory, resetConversation } from '../config/api';

export const Context = createContext();

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

    const onSent = async (prompt, pdfContent = '', useStreaming = true) => {
        setErrorMsg("");

        if (!prompt || prompt.trim() === "") {
            setErrorMsg("Please enter a valid message.");
            return;
        }

        setResultData("");
        setLoading(true);
        setShowResult(true);
        setIsStreaming(useStreaming);

        setPrevPrompts(prev => [...prev, prompt]);
        setRecentPrompt(prompt);

        try {
            if (useStreaming) {
                await streamMessage(prompt, sessionId);
            } else {
                const response = await sendMessage(prompt, pdfContent, sessionId);
                let formattedResponse = response.response;

                formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
                    if (paragraph.trim() === '') return '';
                    return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
                }).join('');

                setResultData(formattedResponse);
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
            setInput("");
        }
    };

    const streamMessage = async (prompt, sessionId) => {
        try {
            const response = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://your-backend-url.render.com'}/api/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: prompt,
                    session_id: sessionId
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
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
                                break;
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
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

    const newChat = async () => {
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
        streamMessage
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
