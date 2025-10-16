// In src/App.jsx
import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
// import { ContextProvider } from './context/Context' // Import ContextProvider

const App = () => {
  return (
    <>  
      <Sidebar />
      <Main />
    </>
  )
}

export default App