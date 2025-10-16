// // In src/components/Main/Main.jsx

import React, { useState, useContext , useEffect} from 'react'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = () => {
  const {onSent,recentPrompt,showResult,loading,resultData,setInput,input, errorMsg} = useContext(Context);

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
    onSent(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className='bg-black w-screen h-screen flex flex-col justify-between text-white relative'>

      {/* Top Nav */}
      <div className='flex justify-between items-center p-4'>
        <p className='text-2xl font-extrabold'>Prat.AI</p>
        <img className='w-10 h-10 rounded-full' src={assets.user} alt="User Icon" />
      </div>

      {/* Chat Content Area */}
      <div className='flex-grow overflow-y-auto px-4 py-4 pt-10' style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
          {showResult ? (
              <div className="max-w-[700px] mx-auto pb-20">
                  {/* User prompt */}
                  <div className='flex items-start gap-4 mb-8'>
                      <img className='w-10 h-10 rounded-full' src={assets.user} alt="User Icon" />
                      <p className='text-gray-300 text-lg font-semibold'>{recentPrompt}</p>
                  </div>
                  {/* AI response */}
                  <div className='flex items-start gap-4'>
                      <img className='w-10 h-10' src={assets.gemini_icon} alt="Gemini Icon" />
                      {loading ? (
                          <div className='w-full flex flex-col gap-2'>
                              <hr className='bg-gray-700 h-4 rounded-full animate-pulse' />
                              <hr className='bg-gray-700 h-4 w-5/6 rounded-full animate-pulse' />
                              <hr className='bg-gray-700 h-4 w-4/6 rounded-full animate-pulse' />
                          </div>
                      ) : (
                          // Changed this to a div for proper HTML rendering
                          <div className='text-gray-300 text-lg leading-relaxed gemini-response-content'>
                              <div dangerouslySetInnerHTML={{ __html: resultData }}></div>
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              <div className='flex-grow flex flex-col items-center justify-center text-center'>
                  <h1 className='bg-gradient-to-r from-blue-600 via-green-800 via-pink-800 to-indigo-900 inline-block text-transparent bg-clip-text text-4xl font-bold'>
                      Hello, User!
                  </h1>
                  <p className='text-gray-500 text-2xl font-bold flex flex-col relative items-center justify-center mt-5'>{currentSarcasticMessage}</p>
              </div>
          )}
      </div>

      {/* Input Box */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black z-10">
          <div className="w-[700px] max-w-[90%] mx-auto flex flex-col gap-2">
              {errorMsg && (
                  <p className="text-red-500 text-sm text-center mb-1">{errorMsg}</p>
              )}
              <div className="flex items-center justify-between gap-4">
                  <input
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                      onKeyPress={handleKeyPress}
                      type="text"
                      placeholder="Ask Prat.AI"
                      className="flex-grow bg-[#2b2b2b] rounded-2xl py-5 px-6 text-gray-300 text-base border border-gray-700 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <img
                      src={assets.send_icon}
                      alt="Send"
                      onClick={handleSend}
                      className='w-10 h-10 cursor-pointer p-2 rounded-full bg-blue-600 hover:bg-gradient-to-r from-blue-900 via-green-500 via-pink-500 to-purple-900 inline-block transition-colors'
                  />
              </div>
          </div>
      </div>
    </div>
  )
}

export default Main;


// Main.jsx
// import React, { useState, useContext } from "react";
// import { AppContext } from "../context/Context";
// import { getGeminiResponse } from "../api/Gemini";
// import { getOpenAIResponse } from "../api/OpenAI";
// import { getClaudeResponse } from "../api/Claude";

// const Main = () => {
//   const { selectedModel } = useContext(AppContext);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const newMessage = { role: "user", content: input };
//     setMessages([...messages, newMessage]);
//     setInput("");

//     let responseText = "";

//     try {
//       if (selectedModel === "openai") {
//         responseText = await getOpenAIResponse(input);
//       } else if (selectedModel === "gemini") {
//         responseText = await getGeminiResponse(input);
//       } else if (selectedModel === "claude") {
//         responseText = await getClaudeResponse(input);
//       }
//     } catch (err) {
//       responseText = "⚠️ Error fetching response!";
//       console.error(err);
//     }

//     setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
//   };

//   return (
//     <div className="main">
//       <div className="chat-window">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`message ${msg.role === "user" ? "user" : "assistant"}`}
//           >
//             {msg.content}
//           </div>
//         ))}
//       </div>

//       <div className="input-box">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default Main;
