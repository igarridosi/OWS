import { useState, useRef } from 'react'
import './index.css'
import MapExplorerPage from './pages/MapExplorerPage';

function App() {
  // Ref for scrolling to map
  const mapSectionRef = useRef(null);

  const handleStartExploring = () => {
    if (mapSectionRef.current) {
      const target = mapSectionRef.current.getBoundingClientRect().top + window.scrollY;
      const duration = 1100; // duration in milliseconds
      const start = window.scrollY;
      const startTime = performance.now();
  
      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeInOutQuad = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
  
        window.scrollTo(0, start + (target - start) * easeInOutQuad);
  
        if (elapsed < duration) {
          requestAnimationFrame(scroll);
        }
      };
  
      requestAnimationFrame(scroll);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#98f0b7] via-[#2ec362] to-accent flex flex-col items-center justify-between relative overflow-x-hidden">
      {/* Glassmorphism Header/Navbar */}
      <img src="src/assets/OWS-logo.png" alt="Calisthenics Hub Logo" className="h-20 md:h-26 object-contain max-w-[100px] md:max-w-[120px] p-1 mt-2 md:mt-0" />  
      <header className="w-full bg-white/30 backdrop-blur-md shadow-lg px-4 md:px-8 py-4 flex flex-col md:flex-row items-center md:justify-around justify-center sticky top-0 z-50 border-b border-white/40 gap-2 md:gap-0 mt-5 md:mt-0">
        <span className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-darkblue tracking-tight drop-shadow-lg font-sans text-center md:text-left m-3 md:m-0">Open Workout Spots</span>
        <nav className="flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-8 items-center w-full md:w-auto justify-center">
          <a href="#explore" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-darkblue text-white font-normal shadow hover:bg-accent hover:text-white transition-all duration-200">Explore</a>
          <a href="#about" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-darkblue text-white font-normal shadow hover:bg-accent hover:text-white transition-all duration-200">About</a>
          <button className="w-full md:w-auto text-center px-5 py-2 rounded-full bg-gradient-to-r from-accent to-[#5fc35d] text-white font-normal shadow-lg hover:scale-105 hover:from-[#5fc35d] hover:to-accent transition-all duration-200 border-none">Login / Signup</button>
        </nav>
      </header>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-8 md:py-20 text-center animate-fade-in px-2 sm:px-4 sm:max-w-3xl">
        <h1 className="text-5xl sm:text-4xl md:text-8xl font-extrabold text-darkblue drop-shadow-lg mb-4 leading-tight">Discover <span className="bg-gradient-to-r to-[#bcc4e0] via-[#dee1e9] from-white underline underline-offset-4 decoration-6 bg-clip-text text-white">Workout Spots</span> all around the World</h1>
        <p className="text-base sm:text-lg md:text-2xl text-white max-w-4xl mx-auto mt-4 mb-8 font-normal italic">Discover, review, and share the best outdoor calisthenics and workout locations near you. Join a community passionate about fitness and the outdoors!</p>
        <button type="button" onClick={handleStartExploring} className="inline-block px-6 sm:px-8 py-3 rounded-full bg-accent text-white font-bold text-base sm:text-lg shadow-lg hover:bg-darkblue hover:text-accent transition-all duration-200">Start Exploring</button>
      </section>
      {/* Main Content */}
      <main ref={mapSectionRef} className="flex flex-col justify-center items-center flex-1 w-full pb-8 md:pb-12 px-1 sm:px-2">
        <div className="w-full max-w-5xl m-4 md:m-0 bg-white/80 rounded-3xl shadow-2xl p-2 md:p-4 border border-white/60 backdrop-blur-md animate-fade-in-up">
          <MapExplorerPage />
        </div>
      </main>
      {/* Footer */}
      <footer className="w-full text-center py-3 md:py-4 text-darkblue bg-white/30 backdrop-blur-md rounded-t-3xl shadow-inner border-t border-white/40 mt-4 md:mt-8 text-sm md:text-base">
        © {new Date().getFullYear()} Open Workout Spots. All rights reserved.
      </footer>
    </div>
  );
}

export default App
