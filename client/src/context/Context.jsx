import React, { createContext, useState, useEffect } from 'react';
import { sendMessage, getChatHistory, resetConversation } from '../config/api';

export const Context = createContext();

const ContextProvider = (props) => {
    // Initialize state from localStorage to prevent flicker
    const getInitialState = () => {
        try {
            const saved = localStorage.getItem('prat_ai_last_state');
            if (saved) {
                const state = JSON.parse(saved);
                return {
                    showResult: state.showResult || false,
                    recentPrompt: state.recentPrompt || "",
                    resultData: state.resultData || ""
                };
            }
        } catch (e) {
            console.error('Error loading saved state:', e);
        }
        return { showResult: false, recentPrompt: "", resultData: "" };
    };
    
    const initialState = getInitialState();
    
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState(initialState.recentPrompt);
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(initialState.showResult);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState(initialState.resultData);
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
    const [attachedPDFInfo, setAttachedPDFInfo] = useState(null);

    const loadHistory = async () => {
        try {
            const history = await getChatHistory(sessionId);
            setChatHistory(history);
            // State already initialized from localStorage, no need to restore again
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

    const onSent = async (prompt, pdfContent = '', pdfInfo = null) => {
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
        setAttachedPDFInfo(pdfInfo);

        try {
            // Use regular API with simulated streaming for reliability
            const response = await sendMessage(prompt, pdfContent, sessionId);
            
            // Stop loading spinner before streaming starts
            setLoading(false);
            
            // Simulate streaming effect character by character for smooth ChatGPT-like experience
            const text = response.response;
            let currentText = '';
            let formatted = '';
            console.log('[STREAMING] Starting character-by-character display, length:', text.length);
            
            for (let i = 0; i < text.length; i++) {
                currentText += text[i];
                formatted = currentText
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-6 text-blue-400">$1</h1>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-5 text-green-400">$1</h2>')
                    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-4 text-purple-400">$1</h3>')
                    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
                    .replace(/\n\n/g, '</p><p class="mb-3">')
                    .replace(/\n/g, '<br/>')
                    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-green-300">$1</code>');
                
                if (!formatted.includes('<h1>') && !formatted.includes('<h2>') && !formatted.includes('<p>')) {
                    formatted = `<p class="mb-3">${formatted}</p>`;
                }
                setResultData(formatted);
                
                // Delay for visible streaming effect
                await new Promise(resolve => setTimeout(resolve, 15)); // 15ms per character
            }
            console.log('[STREAMING] Complete');

            setChatHistory(prev => [...prev, {
                user_message: prompt,
                bot_response: response.response,
                timestamp: new Date().toISOString()
            }]);
            
            // Save current state
            localStorage.setItem('prat_ai_last_state', JSON.stringify({
                showResult: true,
                recentPrompt: prompt,
                resultData: formatted
            }));
        } catch (error) {
            console.error("Error in onSent:", error);
            setResultData("Unable to connect to Prat.AI server. Please ensure the backend is running.");
            setLoading(false);
        } finally {
            setIsStreaming(false);
        }
    };

    const loadPrompt = (prompt) => {
        const chat = chatHistory.find(c => c.user_message === prompt);
        if (chat) {
            setRecentPrompt(chat.user_message);
            const formattedResponse = chat.bot_response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('\n\n').map(p => p.trim() === '' ? '' : `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
            setResultData(formattedResponse);
            setShowResult(true);
            
            // Save state when clicking sidebar chat
            localStorage.setItem('prat_ai_last_state', JSON.stringify({
                showResult: true,
                recentPrompt: chat.user_message,
                resultData: formattedResponse
            }));
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
        
        // Save new chat state
        localStorage.setItem('prat_ai_last_state', JSON.stringify({
            showResult: false,
            recentPrompt: "",
            resultData: ""
        }));
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
        resetConversationHistory,
        attachedPDFInfo
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
