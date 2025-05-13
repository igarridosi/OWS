import { useState, useRef, useEffect } from 'react'
import './index.css'
import MapExplorerPage from './pages/MapExplorerPage';
import LoginForm from './components/common/LoginForm';
import SignUpForm from './components/common/SignUpForm';
import ProfileSettings from './components/common/ProfileSettings';
import { getUserFromToken, logout } from './utils/helpers';
import { fetchCurrentUser, setLogoutHandler } from './services/backendApiService';
import CommunityPage from './pages/CommunityPage';

function App() {
  // Ref for scrolling to map
  const mapSectionRef = useRef(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalKey, setProfileModalKey] = useState(0);

  // Track hash for navigation
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isCommunity = hash === '#community';

  // Fetch user profile on mount if token exists
  useEffect(() => {
    setLogoutHandler(() => {
      localStorage.removeItem('token');
      setUser(null);
    });
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser().then(profile => {
        setUser(profile);
      }).catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  // Helper to refresh user profile from backend
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const profile = await fetchCurrentUser();
      setUser(profile);
    } else {
      setUser(null);
    }
  };

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

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    refreshUserProfile();
  };

  const handleProfileUpdate = () => {
    refreshUserProfile();
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#98f0b7] via-[#2ec362] to-accent flex flex-col items-center justify-between relative overflow-x-hidden">
          <img src="src/assets/OWS-logo.png" alt="Calisthenics Hub Logo" className="h-20 md:h-26 object-contain max-w-[100px] md:max-w-[120px] p-1 mt-2 md:mt-0" />
          <header className="w-full bg-white/30 backdrop-blur-md shadow-lg px-4 md:px-8 py-4 flex flex-col md:flex-row items-center md:justify-around justify-center sticky top-0 z-50 border-b border-white/40 gap-2 md:gap-0 mt-5 md:mt-0">
            <span className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-darkblue tracking-tight drop-shadow-lg font-sans text-center md:text-left m-3 md:m-0">Open Workout Spots</span>
            <nav className="flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-8 items-center w-full md:w-auto justify-center">
              <a href="#explore" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-darkblue text-white shadow hover:bg-accent hover:text-white transition-all duration-200">Explore</a>
              <a href="#about" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-darkblue text-white shadow hover:bg-accent hover:text-white transition-all duration-200">About</a>
              <button
                className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-darkblue text-white shadow hover:bg-accent hover:text-white transition-all duration-200"
                onClick={() => { window.location.hash = '#community'; }}
              >
                Community
              </button>
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center text-lg shadow hover:bg-darkblue hover:scale-105 transition-all duration-200"
                    title="Profile settings"
                    onClick={() => { setShowProfileModal(true); setProfileModalKey(Date.now()); }}
                  >
                    {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                  </button>
                </div>
              ) : (
                <button
                  className="w-full md:w-auto text-center px-5 py-2 rounded-full bg-gradient-to-r from-accent to-[#5fc35d] text-white shadow-lg hover:scale-105 hover:from-[#5fc35d] hover:to-accent transition-all duration-200 border-none"
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                >
                  Login / Signup
                </button>
              )}
            </nav>
          </header>
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#364153cf]">
          <div className="relative">
            <ProfileSettings key={profileModalKey} onClose={() => setShowProfileModal(false)} onProfileUpdate={handleProfileUpdate} />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-darkblue text-xl font-bold"
              onClick={() => setShowProfileModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#364153cf]">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-4 animate-fade-in-up">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-darkblue text-2xl font-bold focus:outline-none"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex justify-center gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 ${authMode === 'login' ? 'bg-accent text-white shadow' : 'bg-gray-100 text-darkblue'}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 ${authMode === 'signup' ? 'bg-accent text-white shadow' : 'bg-gray-100 text-darkblue'}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>
            <div className="w-full flex flex-col gap-2">
              {authMode === 'login' ? (
                <LoginForm onLoginSuccess={handleAuthSuccess} />
              ) : (
                <SignUpForm onSignUpSuccess={handleAuthSuccess} />
              )}
            </div>
            <div className="text-center text-xs text-gray-500 mt-2">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button className="text-accent underline font-bold" onClick={() => setAuthMode('signup')}>Sign Up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="text-accent underline font-bold" onClick={() => setAuthMode('login')}>Login</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
      {!isCommunity && (
        <section className="flex flex-col items-center justify-center py-8 md:py-20 text-center animate-fade-in px-2 sm:px-4 sm:max-w-3xl">
          <h1 className="text-5xl sm:text-4xl md:text-8xl font-extrabold text-darkblue drop-shadow-lg mb-4 leading-tight">Discover <span className="bg-gradient-to-r to-[#bcc4e0] via-[#dee1e9] from-white underline underline-offset-4 decoration-6 bg-clip-text text-white">Workout Spots</span> all around the World</h1>
          <p className="text-base sm:text-lg md:text-2xl text-white max-w-4xl mx-auto mt-4 mb-8 italic">Discover, review, and share the best outdoor calisthenics and workout locations near you. Join a community passionate about fitness and the outdoors!</p>
          <button type="button" onClick={handleStartExploring} className="inline-block px-6 sm:px-8 py-3 rounded-full bg-accent text-white font-bold text-base sm:text-lg shadow-lg hover:bg-darkblue hover:text-accent transition-all duration-200">Start Exploring</button>
        </section>
      )}
      {/* Main Content */}
      <main ref={mapSectionRef} className="flex flex-col justify-center items-center flex-1 w-full pb-8 mt-6 md:pb-12 px-1 sm:px-2">
        <div className="w-full max-w-5xl m-4 md:m-0 bg-white/80 rounded-3xl shadow-2xl p-2 md:p-4 border border-white/60 backdrop-blur-md animate-fade-in-up">
          {/* Show CommunityPage if hash is #community, else MapExplorerPage */}
          {isCommunity ? <CommunityPage user={user} /> : <MapExplorerPage />}
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
