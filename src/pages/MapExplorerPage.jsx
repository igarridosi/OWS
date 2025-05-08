import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MapComponent from '../components/map/MapComponent';
import { reverseGeocode } from '../services/nominatimService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useFavoriteSpots } from '../hooks/useFavoriteSpots';
import AddSpotForm from '../components/map/AddSpotForm';

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

const MapExplorerPage = () => {
  // State for map center (lat, lon) and zoom
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
    const lat = spot.lat !== undefined ? spot.lat : spot.latitude;
    const lon = spot.lon !== undefined ? spot.lon : spot.longitude;
    if (lat === undefined || lon === undefined) return;
    // Switch to correct spot source view
    if (mapComponentRef?.current?.setSpotSource) {
      if (spot.latitude !== undefined && spot.longitude !== undefined) {
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

  // Placeholder submit handler for AddSpotForm
  const handleAddSpotSubmit = async (spotData) => {
    const res = await fetch('http://localhost:3001/api/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spotData),
    });
    if (!res.ok) throw new Error('Failed to add spot');
    // Optionally: refetch spots or update state
    setShowAddSpotForm(false);
  };

  // Handler for starting spot creation
  const handleStartAddSpot = () => {
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
    <div className="flex flex-col m-5 md:m-0 relative">
      {/* Overlay for selecting position */}
      {selectingPosition && (
        <div className="fixed inset-0 z-[999] bg-[#364153d7] rounded-3xl flex items-center justify-center pointer-events-none">
          <div className="absolute left-1/2 top-20 z-[10000] -translate-x-1/2 bg-accent text-white px-6 py-3 rounded shadow-lg text-xl font-extrabold pointer-events-auto">
            Click on the map to select the spot location
          </div>
        </div>
      )}
      {/* Modal for AddSpotForm */}
      {showAddSpotForm && (
        <div className="fixed inset-0 z-10000 rounded-3xl bg-[#ffffff92] flex items-center justify-center">
          <AddSpotForm
            onSubmit={handleAddSpotSubmit}
            onCancel={() => { setShowAddSpotForm(false); setSelectedPosition(null); }}
            latlng={selectedPosition}
          />
        </div>
      )}
      <div className="flex flex-col items-start justify-center w-full relative">
        <button
          type="button"
          className="px-2 py-2 m-4 md:m-0 top-0 right-0 absolute bg-darkblue text-white rounded font-bold shadow hover:bg-accent hover:text-darkblue transition-all duration-200"
          onClick={handleStartAddSpot}
        >
          Add New Spot
        </button>
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-end justify-center">
          {/* Main Map Area */}
          <section className="flex-1 flex flex-col items-center w-full sm:w-[80vw] max-w-3xl">
            <div className="w-full max-w-2xl mb-4 flex flex-col md:flex-row gap-2 items-end justify-between">
              <SearchBar onLocationSelect={handleLocationSelect} userSearch={userSearch} />
            </div>
            <div className="w-full h-[60vh] rounded-2xl shadow-lg overflow-hidden bg-white">
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
              />
            </div>
          </section>
          {/* Favorites Sidebar */}
          <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-lg p-6 h-[60vh] flex flex-col border border-gray-100 overflow-y-auto">
            <div className="text-2xl py-2 font-extrabold rounded text-white bg-gradient-to-br to-accent from-[#67ee96] flex items-center justify-center gap-2 mb-8">
              <span>★</span> Favorite Spots
            </div>
            {favorites.length === 0 ? (
              <div className="text-gray-400 text-md font-extrabold">No favorites yet. Click ☆ on a spot to save it!</div>
            ) : (
              favorites.map(spot => (
                <div key={spot.id} className="flex flex-row justify-between gap-1 border-b border-dotted border-gray-700 pb-2 mb-4">
                  <button
                    className="text-left text-darkblue font-bold hover:underline truncate"
                    title={spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                    onClick={() => handleFavoriteClick(spot)}
                  >
                    {spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                  </button>
                  <div className="flex items-end text-xs text-gray-500">
                    <span>{spot.tags?.country || ''}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${(spot.lat !== undefined ? spot.lat : spot.latitude)},${(spot.lon !== undefined ? spot.lon : spot.longitude)}`}
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