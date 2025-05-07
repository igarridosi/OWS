import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MapComponent from '../components/map/MapComponent';
import { reverseGeocode } from '../services/nominatimService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useFavoriteSpots } from '../hooks/useFavoriteSpots';

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

  // Handler to update map center and zoom from search or locate me
  const handleLocationSelect = (lat, lon, zoomLevel) => {
    setMapCenter([lat, lon]);
    setMapZoom(zoomLevel || 13);
    setFlyToZoom(zoomLevel || 13);
    setSearchBounds(getBoundingBox([lat, lon], 0.05)); // 0.05 deg ~ 5km
  };

  // Handler to update state when user pans/zooms the map
  const handleMapMove = (newCenter, newZoom) => {
    setMapCenter(newCenter);
    setMapZoom(newZoom);
    setFlyToZoom(undefined); // Only flyTo on search, not on manual move
  };

  // Handler to center map on a favorite spot
  const handleFavoriteClick = (spot) => {
    setMapCenter([spot.lat, spot.lon]);
    setMapZoom(16);
    setFlyToZoom(16);
    setSearchBounds(getBoundingBox([spot.lat, spot.lon], 0.01));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center w-full min-h-[90vh] py-8">
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-end justify-center">
          {/* Main Map Area */}
          <section className="flex-1 flex flex-col items-center w-full sm:w-[70vw] max-w-3xl">
            <div className="w-full max-w-2xl mb-4">
              <SearchBar onLocationSelect={handleLocationSelect} />
            </div>
            <div className="w-full h-[60vh] rounded-2xl shadow-lg overflow-hidden bg-white">
              <MapComponent
                center={mapCenter}
                zoom={mapZoom}
                flyToZoom={flyToZoom}
                searchBounds={searchBounds}
                onMapMove={handleMapMove}
              />
            </div>
          </section>
          {/* Favorites Sidebar */}
          <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-lg p-6 h-[60vh] flex flex-col border border-gray-100 overflow-y-auto">
            <div className="text-2xl font-extrabold text-yellow-600 flex items-center gap-2 mb-5">
              <span>★</span> Favorite Spots
            </div>
            {favorites.length === 0 ? (
              <div className="text-gray-400 text-sm">No favorites yet. Click ☆ on a spot to save it!</div>
            ) : (
              favorites.map(spot => (
                <div key={spot.id} className="flex flex-row justify-between gap-1 border-b border-dotted border-gray-700 pb-2 mb-4">
                  <button
                    className="text-left text-gray-800 font-bold hover:underline truncate"
                    title={spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                    onClick={() => handleFavoriteClick(spot)}
                  >
                    {spot.customName || spot.tags?.city || spot.tags?.name || 'Workout Spot'}
                  </button>
                  <div className="flex items-end text-xs text-gray-500">
                    <span>{spot.tags?.country || ''}</span>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lon}`} target="_blank" rel="noopener noreferrer" className="text-gray-200 rounded px-2 py-1 bg-[#4285F4] hover:underline font-bold text-md">Maps ⌕</a>
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