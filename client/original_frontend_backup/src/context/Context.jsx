// In src/context/Context.jsx

import React, { createContext, useEffect, useState } from 'react';
import runChat from '../config/api.js';

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]); // New state to store all prompts
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

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
            const response = await runChat(prompt);
            let formattedResponse = response;

            formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
                if (paragraph.trim() === '') return '';
                return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
            }).join('');

            setResultData(formattedResponse);
        } catch (error) {
            console.error("Error in onSent (API call):", error);
            setResultData("Something went wrong while contacting AI. Please try again.");
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
        prevPrompts ;
        setPrevPrompts([]);
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
        newChat
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;