import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MapComponent from '../components/map/MapComponent';
import { reverseGeocode } from '../services/nominatimService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useFavoriteSpots } from '../hooks/useFavoriteSpots';
import AddSpotForm from '../components/map/AddSpotForm';
import { submitCommunitySpotInbox } from '../services/backendApiService';

const DEFAULT_CENTER = [52.52, 13.405]; // Berlin
const DEFAULT_ZOOM = 13;

function getBoundingBox(center, size = 0.05) {
  // size in degrees, e.g., 0.05 ~ 5km
  const [lat, lon] = center;
  return {
    getSouthWest: () => ({ lat: lat - size, lng: lon - size }),
    getNorthEast: () => ({ lat: lat + size, lng: lon + size }),
  };
}

const MapExplorerPage = ({ user, setShowAuthModal, setAuthMode }) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [flyToZoom, setFlyToZoom] = useState(undefined);
  const [searchBounds, setSearchBounds] = useState(null);
  const { favorites, removeFavorite } = useFavoriteSpots();
  const [showFavoritesMobile, setShowFavoritesMobile] = useState(false);
  const [showAddSpotForm, setShowAddSpotForm] = useState(false);
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const mapComponentRef = React.useRef();
  const [userSearch, setUserSearch] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handler to update map center and zoom from search or locate me
  const handleLocationSelect = (lat, lon, zoomLevel, displayName) => {
    setMapCenter([lat, lon]);
    setMapZoom(zoomLevel || 13);
    setFlyToZoom(zoomLevel || 13);
    setSearchBounds(getBoundingBox([lat, lon], 0.05)); // 0.05 deg ~ 5km
    if (displayName) setUserSearch(displayName);
  };

  // Handler to update state when user pans/zooms the map
  const handleMapMove = (newCenter, newZoom) => {
    setMapCenter(newCenter);
    setMapZoom(newZoom);
    setFlyToZoom(undefined); // Only flyTo on search, not on manual move
  };

  // Handler to center map on a favorite spot
  const handleFavoriteClick = (spot) => {
    const lat = spot.lat !== undefined ? spot.lat : spot.lat;
    const lon = spot.lon !== undefined ? spot.lon : spot.lng;
    if (lat === undefined || lon === undefined) return;
    // Switch to correct spot source view
    if (mapComponentRef?.current?.setSpotSource) {
      if (spot.lat !== undefined && spot.lng !== undefined) {
        // Community Spots gating
        if (!user) {
          setShowLoginPrompt(true);
          setShowAuthModal && setShowAuthModal(true);
          setAuthMode && setAuthMode('login');
          return;
        }
        mapComponentRef.current.setSpotSource('community');
      } else if (spot.lat !== undefined && spot.lon !== undefined) {
        mapComponentRef.current.setSpotSource('osm');
      }
    }
    setMapCenter([lat, lon]);
    setMapZoom(16);
    setFlyToZoom(16);
    setSearchBounds(getBoundingBox([lat, lon], 0.01));
  };

  // Handler for AddSpotForm submission (Community Spots)
  const handleAddSpotSubmit = async (spotData) => {
    // Send to admin inbox for approval
    try {
      await submitCommunitySpotInbox(spotData);
      setShowAddSpotForm(false);
      alert('Your spot submission has been sent for admin review!');
    } catch (err) {
      alert('Failed to submit spot for review.');
    }
  };

  // Handler for starting spot creation
  const handleStartAddSpot = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setAuthMode && setAuthMode('login');
      return;
    }
    setSelectingPosition(true);
    setShowAddSpotForm(false);
    setSelectedPosition(null);
  };

  // Handler for when user selects a position on the map
  const handleMapClickForSpot = (latlng) => {
    setSelectedPosition(latlng);
    setShowAddSpotForm(true);
    setSelectingPosition(false);
  };

  return (
    <div className="flex flex-col m-2 md:m-5 relative">
      {/* Login required modal/message */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[10001] bg-[#364153d7] rounded-3xl flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 m-4 md:m-0 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-2 text-darkblue">Login Required</h2>
            <p className="mb-4 text-gray-700">You must be logged in for accesing this funtionality.</p>
            <button
              className="px-4 py-2 bg-darkblue text-white rounded font-bold hover:bg-accent hover:text-darkblue transition-all duration-200 mr-2"
              onClick={() => {
                setShowAuthModal && setShowAuthModal(true);
                setAuthMode && setAuthMode('login');
                setShowLoginPrompt(false);
              }}
            >Login</button>
            <button
              className="px-4 py-2 bg-gray-200 text-darkblue rounded font-bold hover:bg-gray-300 ml-2"
              onClick={() => setShowLoginPrompt(false)}
            >Cancel</button>
          </div>
        </div>
      )}
      {/* Overlay for selecting position */}
      {selectingPosition && (
        <div className="fixed inset-0 z-[999] bg-[#364153d7] rounded-3xl flex items-center justify-center pointer-events-none">
          <div className="absolute text-center top-6 left-1/2 md:top-20 z-[10000] -translate-x-1/2 bg-accent text-white px-4 py-2 md:px-6 md:py-3 rounded shadow-lg text-base md:text-xl font-extrabold pointer-events-auto">
            Click on the map to select the spot location
          </div>
        </div>
      )}
      {/* Modal for AddSpotForm */}
      {showAddSpotForm && (
        <div className="fixed inset-0 z-10000 bg-[#ffffffcc] rounded-3xl flex items-center justify-center p-2 md:p-0">
          <AddSpotForm
            onSubmit={handleAddSpotSubmit}
            onCancel={() => { setShowAddSpotForm(false); setSelectedPosition(null); }}
            latlng={selectedPosition}
          />
        </div>
      )}
      <div className="flex flex-col items-start justify-center w-full relative">
        <p className='md:m-0 hidden md:block md:top-0 md:right-0 italic md:absolute font-bold text-darkblue text-xl'>Don't you see a spot?</p>
        <button
          type="button"
          className="px-3 py-2 m-2 md:m-0 hidden md:block md:top-10 md:right-0 md:absolute bg-darkblue text-white rounded font-bold shadow hover:bg-accent hover:text-darkblue transition-all duration-200 text-sm md:text-base"
          onClick={handleStartAddSpot}
        >
          Add New Spot
        </button>
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full max-w-6xl items-end justify-center">
          {/* Main Map Area */}
          <section className="flex-1 flex flex-col items-center w-full sm:w-[98vw] md:w-[80vw] max-w-3xl">
            <div className="w-full max-w-2xl mb-2 md:mb-4 flex flex-col md:flex-row gap-2 items-end justify-between px-1 md:px-0">
              <SearchBar onLocationSelect={handleLocationSelect} userSearch={userSearch} />
            </div>
            <div className="w-full h-[45vh] xs:h-[55vw] sm:h-[60vw] md:h-[60vh] rounded-2xl shadow-lg overflow-hidden bg-white">
              <MapComponent
                ref={mapComponentRef}
                center={mapCenter}
                zoom={mapZoom}
                flyToZoom={flyToZoom}
                searchBounds={searchBounds}
                onMapMove={handleMapMove}
                selectingPosition={selectingPosition}
                onSelectPosition={handleMapClickForSpot}
                selectedPosition={selectedPosition}
                user={user}
                onRequireLogin={() => setShowLoginPrompt(true)}
              />
            </div>
            <p className='md:m-0 sm:hidden mt-5 block md:top-0 md:right-0 md:absolute self-start font-bold text-darkblue text-lg italic'>Don't you see a spot?</p>
            <button
              type="button"
              className="w-full px-3 py-2 mt-3 justify-center md:mt-0 flex self-start sm:hidden bg-white text-darkblue rounded font-bold shadow hover:bg-accent hover:text-darkblue transition-all duration-200 text-xl md:text-base"
              onClick={handleStartAddSpot}
            >
              Add New Spot
            </button>
          </section>
          {/* Favorites Sidebar */}
          <aside className="w-full mt-4 md:mt-0 lg:w-80 bg-white rounded-2xl shadow-lg p-3 md:p-6 h-[30vh] xs:h-[35vh] sm:h-[40vh] md:h-[60vh] flex flex-col border border-gray-100 overflow-y-auto">
            <div className="text-lg md:text-2xl py-2 font-extrabold rounded text-white bg-gradient-to-br to-accent from-[#67ee96] flex items-center justify-center gap-2 mb-4 md:mb-8">
              <span>★</span> Favorite Spots
            </div>
            {favorites.length === 0 ? (
              <div className="text-gray-400 text-md font-extrabold">No favorites yet. Click ☆ on a spot to save it!</div>
            ) : (
              favorites.map(spot => (
                <div key={spot.id} className="flex flex-row justify-between gap-1 border-b border-dotted border-gray-700 pb-2 mb-2 md:mb-4">
                  <button
                    className="text-left text-darkblue font-bold underline md:no-underline hover:underline truncate max-w-[60vw] md:max-w-[12rem]"
                    title={spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                    onClick={() => handleFavoriteClick(spot)}
                  >
                    {spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                  </button>
                  <div className="flex items-end text-xs text-gray-500 gap-1">
                    <span className="hidden xs:inline">{spot.tags?.country || ''}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${(spot.lat !== undefined ? spot.lat : spot.lat)},${(spot.lon !== undefined ? spot.lon : spot.lng)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 rounded px-2 py-1 bg-darkblue hover:underline font-bold text-md"
                    >
                      Maps ⌕
                    </a>
                    <button
                      className="ml-1 text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-red-400 hover:text-white transition"
                      onClick={() => removeFavorite(spot.id)}
                    >Remove</button>
                  </div>
                </div>
              ))
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MapExplorerPage;