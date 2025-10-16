import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = () => {
  const { onSent, recentPrompt, showResult, loading, resultData, setInput, input, errorMsg, showAbout, setShowAbout } = useContext(Context);

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
    if (input.trim()) onSent(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
          <button onClick={() => setShowAbout(true)} className='text-sm text-gray-400 hover:text-white transition-colors'>About</button>
          <img className='w-10 h-10 rounded-full border-2 border-gray-800' src={assets.user} alt="User Icon" />
        </div>
      </div>

      <div className='flex-grow overflow-y-auto px-4 py-4 pt-10' style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #000' }}>
        {showResult ? (
          <div className="max-w-[700px] mx-auto pb-20 space-y-6">
            <div className='flex items-start gap-5 p-5 rounded-xl bg-gray-900/30'>
              <img className='w-11 h-11 rounded-full' src={assets.user} alt="User Icon" />
              <p className='text-white text-2xl font-normal leading-relaxed pt-1'>{recentPrompt}</p>
            </div>
            <div className='flex items-start gap-5 p-6 rounded-xl bg-gray-900/50'>
              <img className='w-11 h-11 rounded-lg' src={assets.gemini_icon} alt="AI Icon" />
              {loading ? (
                <div className='w-full flex flex-col gap-3'>
                  <div className='bg-gray-800 h-5 rounded-full animate-pulse' />
                  <div className='bg-gray-800 h-5 w-5/6 rounded-full animate-pulse' />
                  <div className='bg-gray-800 h-5 w-4/6 rounded-full animate-pulse' />
                </div>
              ) : (
                <div className='text-white text-2xl font-normal flex-1' style={{ lineHeight: '1.75', letterSpacing: '0.01em' }}>
                  <div dangerouslySetInnerHTML={{ __html: resultData }}></div>
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
        <div className="w-[700px] max-w-[90%] mx-auto flex flex-col gap-2">
          {errorMsg && (
            <p className="text-red-400 text-sm text-center mb-1 bg-red-500/10 py-2 rounded-lg">{errorMsg}</p>
          )}
          <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-2xl p-2 border border-gray-800 shadow-lg">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyPress={handleKeyPress}
              type="text"
              placeholder="Ask Prat.AI anything..."
              className="flex-1 bg-transparent py-3 px-4 text-gray-200 text-base outline-none placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className='p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
            >
              <img src={assets.send_icon} alt="Send" className='w-5 h-5' />
            </button>
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
