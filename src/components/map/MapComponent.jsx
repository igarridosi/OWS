import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { fetchSpotsByBounds } from '../../services/backendApiService';
import L from 'leaflet';
import customMarkerImg from '../../assets/marker3.png'; // Place your image in src/assets/
import { useFavoriteSpots } from '../../hooks/useFavoriteSpots';
import SpotReviewsPanel from './SpotReviewsPanel';

const DEFAULT_CENTER = [50, 10]; // Europe-wide view
const DEFAULT_ZOOM = 4;

const customIcon = new L.Icon({
  iconUrl: customMarkerImg,
  iconSize: [48, 48], // Adjust size as needed
  iconAnchor: [24, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  className: 'custom-leaflet-marker', // Optional: for further CSS styling
});

function FlyToHandler({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

function MapComponent({ center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, flyToZoom, searchBounds }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavoriteSpots();
  const [showNameInput, setShowNameInput] = useState(null); // spot.id or null
  const [customName, setCustomName] = useState('');
  const [activePopup, setActivePopup] = useState(null); // track which popup is open
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('calisthenics_map_style') || 'normal');
  const [openReviewsSpotId, setOpenReviewsSpotId] = useState(null);

  useEffect(() => {
    localStorage.setItem('calisthenics_map_style', mapStyle);
  }, [mapStyle]);

  const tileLayerProps =
    mapStyle === 'satellite'
      ? {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles © Esri'
        }
      : {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors © CartoDB'
        };

  // Ensure popup UI updates when favorites change
  useEffect(() => {
    setShowNameInput(null);
    setCustomName('');
  }, [favorites]);

  // Fetch spots only when searchBounds changes (i.e., after a search)
  useEffect(() => {
    if (!searchBounds) return;
    setLoading(true);
    setError(null);
    fetchSpotsByBounds(searchBounds)
      .then((data) => setSpots(data))
      .catch(() => setError('Failed to load spots'))
      .finally(() => setLoading(false));
  }, [searchBounds]);

  return (
    <div className="relative h-full w-full">
      {/* Map style toggle button - always top right, above map */}
      <button
        className="absolute top-2 right-2 z-[1000] bg-white border border-gray-300 rounded px-3 py-1 shadow hover:bg-gray-100 transition"
        style={{ minWidth: 120 }}
        onClick={() => setMapStyle(mapStyle === 'urban' ? 'satellite' : 'urban')}
      >
        {mapStyle === 'urban' ? 'Urban View' : 'Satellite View'}
      </button>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-[70vh] w-full rounded-lg shadow"
        scrollWheelZoom={true}
      >
        <TileLayer {...tileLayerProps} />
        <FlyToHandler center={center} zoom={flyToZoom || zoom} />
        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lon]} icon={customIcon}>
            <Popup
              eventHandlers={{
                add: () => setActivePopup(spot.id),
                remove: () => {
                  setShowNameInput(null);
                  setCustomName('');
                  setActivePopup(null);
                },
              }}
            >
              <div className="min-w-[200px] max-w-[260px] p-2">
                <div className="font-bold text-gray-700 text-lg mb-1 truncate">{spot.name || 'Workout Spot'}</div>
                {spot.tags?.sport && <div className="text-xs text-gray-500 mb-1"><b>Sport:</b> {spot.tags.sport}</div>}
                {spot.tags?.leisure && <div className="text-xs text-gray-500 mb-1"><b>Type:</b> {spot.tags.leisure}</div>}
                {spot.tags?.fitness_station && <div className="text-xs text-gray-500 mb-1"><b>Equipment:</b> {spot.tags.fitness_station}</div>}
                <div className="flex flex-col items-center justify-center mt-4">
                
                  <a href={spot.osmUrl} target="_blank" rel="noopener noreferrer" className=" bg-[#abd65c] text-xs font-medium px-2 py-1 mb-2 rounded hover:bg-green-500 transition">OSM</a>
                  <a
                    className="text-xs bg-[#4285F4] text-white no-underline rounded px-2 py-1 hover:bg-gray-700 transition"
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Maps ⌕
                  </a>
                  <button
                    className="mt-2 text-xs bg-gray-600 text-white rounded px-2 py-1 hover:bg-gray-700 transition"
                    onClick={() => setOpenReviewsSpotId(spot.id)}
                  >
                    Show Reviews & Gallery
                  </button>
                </div>
                <div className="mt-2 flex flex-col items-center gap-1">
                  {isFavorite(spot.id) ? (
                    <button
                      className="text-xs px-3 py-1 rounded bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition"
                      onClick={() => removeFavorite(spot.id)}
                    >
                      ★ Remove Favorite
                    </button>
                  ) : showNameInput === spot.id && activePopup === spot.id ? (
                    <form
                      className="flex gap-1 items-center mt-1"
                      onSubmit={e => {
                        e.preventDefault();
                        addFavorite(spot, customName.trim() || undefined);
                        setShowNameInput(null);
                        setCustomName('');
                      }}
                    >
                      <input
                        type="text"
                        className="text-xs px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-gray-400"
                        placeholder="Enter a name..."
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        autoFocus
                        maxLength={40}
                      />
                      <button type="submit" className="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition">Save</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition" onClick={() => { setShowNameInput(null); setCustomName(''); }}>Cancel</button>
                    </form>
                  ) : (
                    <button
                      className="text-xs px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-yellow-400 hover:text-white transition"
                      onClick={e => {
                        e.stopPropagation();
                        setShowNameInput(spot.id);
                        setCustomName('');
                      }}
                    >
                      ☆ Save to Favorites
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {/* Reviews & Gallery Modal */}
      {openReviewsSpotId && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500 font-bold z-10"
              onClick={() => setOpenReviewsSpotId(null)}
              aria-label="Close reviews panel"
            >
              &times;
            </button>
            <SpotReviewsPanel spotId={openReviewsSpotId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;