import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import PDFUpload from '../PDFUpload/PDFUpload'

const Main = () => {
  const { onSent, recentPrompt, showResult, loading, resultData, setInput, input, errorMsg, showAbout, setShowAbout, isStreaming, newChat, resetConversationHistory } = useContext(Context);
  const [attachedPDF, setAttachedPDF] = useState(null);
  const [pdfContent, setPdfContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sarcasticMessages = [
    "Oh, it's you again. What now?",
    "Seriously? Another question already?",
    "My thoughts were profound until you showed up. What's on your mind?",
    "Just when I was relaxing... What do you need?",
    "You again? What do you want?",
    "Oh, it's your turn now. Go on.",
    "I was just about to take a nap. What's so important?",
    "Ready for some brilliance? My brilliance, obviously.",
    "Another day, another question. Try to make it interesting."
  ];

  const [currentSarcasticMessage, setCurrentSarcasticMessage] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sarcasticMessages.length);
    setCurrentSarcasticMessage(sarcasticMessages[randomIndex]);
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      const message = input.trim();
      onSent(message, pdfContent);
      // Clear PDF after sending
      setAttachedPDF(null);
      setPdfContent('');
    }
  };

  const handlePDFUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    
    try {
      setUploadProgress(10);
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(50);
      // Use same logic as api.js for consistent URL detection
      let apiUrl;
      if (import.meta.env.VITE_API_URL) {
        apiUrl = import.meta.env.VITE_API_URL;
      } else if (window.location.hostname === 'chat-bot-inzint-assignment.vercel.app') {
        apiUrl = 'https://chatbot-inzintassignment.onrender.com/api';
      } else {
        apiUrl = 'http://localhost:8000/api';
      }
      const baseUrl = apiUrl.replace('/api', '');
      const response = await fetch(`${baseUrl}/api/process-pdf`, {
        method: 'POST',
        body: formData,
      });
      
      setUploadProgress(80);
      if (response.ok) {
        const result = await response.json();
        setAttachedPDF(file);
        setPdfContent(result.content);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      alert('Failed to process PDF. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePDFUpload(files[0]);
    }
  };

  const removePDF = () => {
    setAttachedPDF(null);
    setPdfContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='bg-black w-screen h-screen flex flex-col justify-between text-white relative'>
      <div className='flex justify-between items-center p-4 border-b border-gray-900'>
        <div className='flex items-center gap-3'>
          <p className='text-2xl font-extrabold'>Prat.AI</p>
          <span className='text-xs bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-1 rounded-full'>Hybrid AI</span>
        </div>
        <div className='flex items-center gap-3'>
          <button 
            onClick={() => {
              if (window.confirm('Clear current conversation?')) {
                newChat();
              }
            }}
            className='text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-gray-800'
          >
            Clear
          </button>
          <button onClick={() => setShowAbout(true)} className='text-sm text-gray-400 hover:text-white transition-colors'>About</button>
          <img className='w-10 h-10 rounded-full border-2 border-gray-800' src={assets.user} alt="User Icon" />
        </div>
      </div>

      <div className='flex-grow overflow-y-auto px-4 py-4 pt-10' style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #000' }}>
        {showResult ? (
          <div className="max-w-[900px] mx-auto pb-20 space-y-6">
            <div className='flex items-start gap-5 p-5 rounded-xl bg-gray-900/30'>
              <img className='w-11 h-11 rounded-full' src={assets.user} alt="User Icon" />
              <div className='flex-1'>
                {attachedPDF && (
                  <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PDF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{attachedPDF.name}</p>
                        <p className="text-xs text-gray-400">{(attachedPDF.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
                <p className='text-white text-2xl font-normal leading-relaxed pt-1'>{recentPrompt}</p>
              </div>
            </div>
            <div className='flex items-start gap-5 p-6 rounded-xl bg-gray-900/50'>
              <img className='w-11 h-11 rounded-lg' src={assets.gemini_icon} alt="AI Icon" />
              {loading ? (
                <div className='w-full flex flex-col gap-3'>
                  {isStreaming ? (
                    <div className='flex items-center gap-2'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'></div>
                        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                        <div className='w-2 h-2 bg-pink-500 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className='text-gray-400 text-sm'>Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className='bg-gray-800 h-5 rounded-full animate-pulse' />
                      <div className='bg-gray-800 h-5 w-5/6 rounded-full animate-pulse' />
                      <div className='bg-gray-800 h-5 w-4/6 rounded-full animate-pulse' />
                    </>
                  )}
                </div>
              ) : (
                <div className='text-white text-2xl font-normal flex-1' style={{ lineHeight: '1.75', letterSpacing: '0.01em' }}>
                  <div dangerouslySetInnerHTML={{ __html: resultData }}></div>
                  {isStreaming && (
                    <span className='inline-block w-1 h-6 bg-blue-500 animate-pulse ml-1 rounded-sm'></span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex-grow flex flex-col items-center justify-center text-center px-4'>
            <div className='mb-6'>
              <img src={assets.user} alt="Prat.AI" className='w-24 h-24 mx-auto mb-4 rounded-full shadow-lg' />
            </div>
            <h1 className='bg-gradient-to-r from-blue-600 via-green-800 via-pink-800 to-indigo-900 inline-block text-transparent bg-clip-text text-5xl font-bold mb-4'>
              Hello, User!
            </h1>
            <p className='text-gray-400 text-xl max-w-2xl mb-8'>{currentSarcasticMessage}</p>
            <div className='grid grid-cols-2 gap-3 max-w-xl'>
              <div className='p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-blue-600 transition-colors cursor-pointer'>
                <p className='text-sm text-gray-400'>💡 Explain concepts</p>
              </div>
              <div className='p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-purple-600 transition-colors cursor-pointer'>
                <p className='text-sm text-gray-400'>🚀 Help with code</p>
              </div>
              <div className='p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-green-600 transition-colors cursor-pointer'>
                <p className='text-sm text-gray-400'>📚 Answer questions</p>
              </div>
              <div className='p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-pink-600 transition-colors cursor-pointer'>
                <p className='text-sm text-gray-400'>💬 Have conversations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
        <div className="w-[900px] max-w-[90%] mx-auto flex flex-col gap-2">
          {errorMsg && (
            <p className="text-red-400 text-sm text-center mb-1 bg-red-500/10 py-2 rounded-lg">{errorMsg}</p>
          )}
          <div className="flex flex-col gap-2">
            {attachedPDF && (
              <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">PDF</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{attachedPDF.name}</p>
                      <p className="text-xs text-gray-500">{(attachedPDF.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                    </div>
                  </div>
                  <button
                    onClick={removePDF}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Processing... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            )}
            <div 
              className={`flex items-center gap-3 bg-[#1a1a1a] rounded-2xl p-2 border shadow-lg transition-all relative ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files[0] && handlePDFUpload(e.target.files[0])}
                className="hidden"
                id="pdf-attach"
              />
              <label 
                htmlFor="pdf-attach" 
                className="p-2 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors relative group"
                title="Upload PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </label>
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder={attachedPDF ? `Ask about ${attachedPDF.name}...` : isDragging ? "Drop PDF here..." : "Ask Prat.AI anything..."}
                className="flex-1 bg-transparent py-3 px-2 text-gray-200 text-base outline-none placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className='p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
              >
                {loading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <img src={assets.send_icon} alt="Send" className='w-5 h-5' />
                )}
              </button>
              {isDragging && !attachedPDF && (
                <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-2xl flex items-center justify-center backdrop-blur-sm z-10">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-blue-400 font-medium">Drop PDF here</p>
                    <p className="text-blue-300 text-sm">Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className='text-xs text-gray-600 text-center'>Prat.AI can make mistakes. Verify important information.</p>
        </div>
      </div>



      {showAbout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-2xl w-full border border-gray-800 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 inline-block text-transparent bg-clip-text">About Prat.AI</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Prat.AI is an indigenous hybrid AI assistant designed for explainability, efficiency, and developer transparency — blending classical ML models with LLM-level reasoning. Built by Pratyush Srivastava under PratWare, it demonstrates how local AI stacks can achieve intelligent, context-aware conversations while maintaining full customization and control.
            </p>
            <div className="bg-[#0f0f0f] p-5 rounded-xl mb-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Key Features:</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Intent Classification using scikit-learn</li>
                <li className='flex items-center gap-2'><span className='text-purple-500'>✓</span> Sentiment Analysis for emotion understanding</li>
                <li className='flex items-center gap-2'><span className='text-green-500'>✓</span> Retrieval-Augmented Generation (RAG)</li>
                <li className='flex items-center gap-2'><span className='text-pink-500'>✓</span> Gemini API for complex reasoning</li>
                <li className='flex items-center gap-2'><span className='text-yellow-500'>✓</span> Confidence-based hybrid routing</li>
                <li className='flex items-center gap-2'><span className='text-orange-500'>✓</span> PDF Upload & Query Support</li>
              </ul>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Created by <span className="text-blue-400 font-semibold">Pratyush Srivastava</span> • CEO of <span className="text-purple-400 font-semibold">PratWare — Multiverse of Softwares</span>
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Main;
