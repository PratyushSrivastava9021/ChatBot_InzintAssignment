// //in src /components/Sidebar/Sidebar
// import React, { useContext, useState } from 'react'
// import { assets } from '../../assets/assets'
// import { Context } from '../../context/Context';

// const Sidebar = () => {
//     const [extend, setExtend] = useState(false);
//     const { prevPrompts, loadPrompt, newChat } = useContext(Context); // Removed setRecentPrompt as it's not used directly here

//     const [showSettingsMessage, setShowSettingsMessage] = useState(false);

//     const toggleSettingsMessage = () => {
//         setShowSettingsMessage(prev => !prev);
//     };

//     return (
//         <div className={`h-screen flex flex-col justify-between p-3 text-white bg-[#232222] transition-all duration-300 ease-in-out
//             ${extend ? 'w-64' : 'w-[70px]'}`}>

//             {/* Top Section */}
//             <div>
//                 {/* Menu Icon */}
//                 <div
//                     onClick={() => setExtend(!extend)}
//                     className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-[#333333] p-2 rounded-md transition-all duration-200"
//                 >
//                     <img src={assets.menu_icon} alt="" className="w-6 h-6" />
//                     {extend && <p className="font-bold">Prat.AI</p>}
//                 </div>

//                 {/* New Chat Button */}
//                 <div
//                     onClick={newChat} // <-- Calls newChat from Context
//                     className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-[#333333] p-2 rounded-md"
//                 >
//                     <img src={assets.plus_icon} alt="" className="w-6 h-6" />
//                     {extend && <p className="font-medium">New Chat</p>}
//                 </div>

//                 {/* Recent Section */}
//                 {extend ? (
//                     <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-250px)]">
//                         <p className="text-xs text-gray-400 mb-2 ml-2">Recent</p>
//                         {prevPrompts.map((item, index) => {
//                             return (
//                                 <div
//                                     key={index}
//                                     onClick={() => loadPrompt(item)}
//                                     className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-[#333333] p-2 rounded-md text-sm"
//                                 >
//                                     <img src={assets.message_icon} alt="" className="w-5 h-5" />
//                                     <p className="truncate">{item.slice(0, 18)}{item.length > 18 ? '...' : ''}</p>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : null}
//             </div>

//             {/* Bottom Section */}
//             <div className="flex flex-col gap-3 text-sm">
//                 <div
//                     className="flex items-center gap-3 cursor-pointer hover:bg-[#333333] p-2 rounded-md"
//                     onClick={toggleSettingsMessage}
//                 >
//                     <img src={assets.setting_icon} alt="" className="w-5 h-5" />
//                     {extend && <p>Settings and Help</p>}
//                 </div>
//             </div>

//             {/* Conditionally render the settings message/modal */}
//             {extend && showSettingsMessage && (
//                 <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center p-4 z-20">
//                     <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
//                         <h1 className="text-xl font-bold mb-4">Message from the Founder and CEO</h1>
//                         <p className="text-gray-300 mb-6">
//                             Currently the Prat.AI Team and Founder/CEO <b>Pratyush Srivastava</b> are working hard to make this AI Model up to the production level LLM. We are sorry, but for now this feature is only available for Premium Subscription.
//                         </p>
//                         <button
//                             onClick={() => setShowSettingsMessage(false)}
//                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
//                         >
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default Sidebar;

// Sidebar.jsx
import React, { useContext } from "react";
import { AppContext } from "../context/Context.jsx";

const Sidebar = () => {
  const { setSelectedModel, selectedModel } = useContext(AppContext);

  return (
    <div className="sidebar">
      <h2 className="logo">Prat.AI</h2>

      {/* Model Selection */}
      <div className="model-selector">
        <label>Select AI Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="openai">GPT-4 (OpenAI)</option>
          <option value="gemini">Gemini</option>
          <option value="claude">Claude</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;
