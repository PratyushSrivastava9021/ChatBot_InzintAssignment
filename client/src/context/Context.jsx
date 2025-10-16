import React, { createContext, useState } from 'react';
import { sendMessage } from '../config/api';

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

    const onSent = async (prompt) => {
        setErrorMsg("");

        if (!prompt || prompt.trim() === "") {
            setErrorMsg("Please enter a valid message.");
            return;
        }

        setResultData("");
        setLoading(true);
        setShowResult(true);

        setPrevPrompts(prev => [...prev, prompt]);
        setRecentPrompt(prompt);

        try {
            const response = await sendMessage(prompt);
            let formattedResponse = response.response;

            formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
                if (paragraph.trim() === '') return '';
                return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
            }).join('');

            setResultData(formattedResponse);
        } catch (error) {
            console.error("Error in onSent:", error);
            setResultData("Unable to connect to Prat.AI server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt);
        await onSent(prompt);
    }

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setRecentPrompt("");
        setInput("");
        setResultData("");
        setErrorMsg("");
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
        setShowAbout
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
