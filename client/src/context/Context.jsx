import React, { createContext, useState, useEffect } from 'react';
import { sendMessage, sendMessageStream, getChatHistory } from '../config/api';

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
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
    const [currentConversationId, setCurrentConversationId] = useState(null);

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

        setResultData("");
        setLoading(true);
        setShowResult(true);
        setInput("");

        setPrevPrompts(prev => [...prev, prompt]);
        setRecentPrompt(prompt);

        // Use existing conversation_id or create from first message
        let conversationId = currentConversationId;
        if (!conversationId) {
            conversationId = `conv_${sessionId}_${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
            setCurrentConversationId(conversationId);
        }

        let streamedResponse = "";
        let responseMetadata = {};

        try {
            await sendMessageStream(
                prompt,
                pdfContent,
                sessionId,
                conversationId,
                // onChunk
                (chunk, responseType, metadata) => {
                    if (metadata) {
                        responseMetadata = metadata;
                        return;
                    }
                    streamedResponse += chunk;
                    let formattedResponse = streamedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
                        if (paragraph.trim() === '') return '';
                        return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
                    }).join('');
                    setResultData(formattedResponse);
                },
                // onComplete
                (fullResponse, responseType, returnedConvId) => {
                    let formattedResponse = fullResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
                        if (paragraph.trim() === '') return '';
                        return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
                    }).join('');
                    setResultData(formattedResponse);
                    setChatHistory(prev => [...prev, {
                        user_message: prompt,
                        bot_response: fullResponse,
                        timestamp: new Date().toISOString(),
                        conversation_id: conversationId,
                        has_pdf: !!pdfContent,
                        pdf_name: pdfContent ? 'Attached PDF' : null
                    }]);
                    setLoading(false);
                    // Refresh from database to update sidebar
                    setTimeout(async () => {
                        try {
                            const freshHistory = await getChatHistory(sessionId);
                            setChatHistory(freshHistory);
                        } catch (error) {
                            console.error('Error refreshing history:', error);
                        }
                    }, 500);
                },
                // onError
                (error) => {
                    console.error("Error in onSent:", error);
                    setResultData("Unable to connect to Prat.AI server. Please ensure the backend is running.");
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error("Error in onSent:", error);
            setResultData("Unable to connect to Prat.AI server. Please ensure the backend is running.");
            setLoading(false);
        }
    };

    const loadPrompt = (prompt) => {
        const chat = chatHistory.find(c => c.user_message === prompt);
        if (chat) {
            setLoading(false);
            setRecentPrompt(chat.user_message);
            const formattedResponse = chat.bot_response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('\n\n').map(p => p.trim() === '' ? '' : `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
            setResultData(formattedResponse);
            setShowResult(true);
            setCurrentConversationId(chat.conversation_id);
        }
    }

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setRecentPrompt("");
        setInput("");
        setResultData("");
        setErrorMsg("");
        setCurrentConversationId(null);
    }

    const resetConversation = async () => {
        setLoading(false);
        setShowResult(false);
        setRecentPrompt("");
        setInput("");
        setResultData("");
        setErrorMsg("");
        setCurrentConversationId(null);
        // Fetch fresh data from database
        try {
            const freshHistory = await getChatHistory(sessionId);
            setChatHistory(freshHistory);
        } catch (error) {
            console.error('Error refreshing history:', error);
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
        resetConversation,
        showAbout,
        setShowAbout,
        sessionId,
        chatHistory,
        loadHistory
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
