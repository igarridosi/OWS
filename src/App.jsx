import { useState } from 'react'
import './App.css'
import MapExplorerPage from './pages/MapExplorerPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navbar */}
      <header className="w-full bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-100000">
        <div className="flex items-center gap-2">
          <img src="src\assets\marker3.png" alt="Calisthenics Hub Logo" className="h-12 w-12" />
          <span className="text-xl font-bold text-gray-700 tracking-tight">Calisthenics Hub</span>
        </div>
        <nav className="flex gap-6 items-center">
          <a href="#explore" className="text-gray-700 hover:text-gray-600 font-medium transition">Explore</a>
          <a href="#about" className="text-gray-700 hover:text-gray-600 font-medium transition">About</a>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-700 transition">Login / Signup</button>
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex flex-col justify-center items-center">
        <MapExplorerPage />
      </main>
    </div>
  );
}

export default App
