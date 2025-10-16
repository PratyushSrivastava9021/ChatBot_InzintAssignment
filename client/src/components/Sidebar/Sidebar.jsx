import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Sidebar = () => {
    const [extend, setExtend] = useState(false);
    const { prevPrompts, loadPrompt, newChat } = useContext(Context);

    return (
        <div className={`h-screen flex flex-col justify-between p-4 text-white bg-gradient-to-b from-[#2a2a2a] to-[#1f1f1f] border-r border-gray-700 transition-all duration-300 ease-in-out
            ${extend ? 'w-72' : 'w-[75px]'}`}>

            <div>
                <div
                    onClick={() => setExtend(!extend)}
                    className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-gray-500/50 p-3 rounded-xl transition-all duration-200"
                >
                    <img src={assets.menu_icon} alt="" className="w-7 h-7 brightness-200" />
                    {extend && <p className="font-bold text-lg">Menu</p>}
                </div>

                <div
                    onClick={newChat}
                    className="flex items-center gap-4 mb-6 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-xl transition-all shadow-lg"
                >
                    <img src={assets.plus_icon} alt="" className="w-6 h-6" />
                    {extend && <p className="font-semibold">New Chat</p>}
                </div>

                {extend ? (
                    <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-280px)] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                        <p className="text-sm text-gray-400 mb-3 ml-2 font-semibold">Recent Chats</p>
                        {prevPrompts.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => loadPrompt(item)}
                                    className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-gray-800/60 p-3 rounded-lg text-sm transition-all border border-transparent hover:border-gray-700"
                                >
                                    <img src={assets.message_icon} alt="" className="w-5 h-5 opacity-70" />
                                    <p className="truncate text-gray-300">{item.slice(0, 22)}{item.length > 22 ? '...' : ''}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                    <img src={assets.setting_icon} alt="" className="w-5 h-5" />
                    {extend && <p className="text-sm text-gray-300 font-medium">Hybrid ML+LLM</p>}
                </div>
            </div>
        </div>
    )
}

export default Sidebar;
