import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { fetchSpotsByBounds } from '../../services/backendApiService';
import L from 'leaflet';
import customMarkerImg from '../../assets/marker3.png'; // Place your image in src/assets/
import { useFavoriteSpots } from '../../hooks/useFavoriteSpots';
import SpotReviewsPanel from './SpotReviewsPanel';
import '../../index.css'
import { useMapEvent } from 'react-leaflet';

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

function SelectPositionHandler({ selectingPosition, onSelectPosition }) {
  useMapEvent('click', (e) => {
    if (selectingPosition && onSelectPosition) {
      const { lat, lng } = e.latlng;
      onSelectPosition({ lat, lng });
    }
  });
  return null;
}

const MapComponent = forwardRef(function MapComponent({ center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, flyToZoom, searchBounds, selectingPosition, onSelectPosition, selectedPosition }, ref) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavoriteSpots();
  const [showNameInput, setShowNameInput] = useState(null); // spot.id or null
  const [customName, setCustomName] = useState('');
  const [activePopup, setActivePopup] = useState(null); // track which popup is open
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('calisthenics_map_style') || 'normal');
  const [openReviewsSpot, setOpenReviewsSpot] = useState(null);
  const [spotSource, setSpotSource] = useState('osm'); // 'osm' or 'community'

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

  // Fetch OSM spots when spotSource is 'osm' and searchBounds changes
  useEffect(() => {
    if (spotSource !== 'osm' || !searchBounds) return;
    setLoading(true);
    setError(null);
    fetchSpotsByBounds(searchBounds)
      .then((data) => setSpots(data))
      .catch(() => setError('Failed to load OSM spots'))
      .finally(() => setLoading(false));
  }, [searchBounds, spotSource]);

  // Fetch community spots when spotSource is 'community'
  useEffect(() => {
    if (spotSource !== 'community') return;
    setLoading(true);
    setError(null);
    fetch('http://localhost:3001/api/spots')
      .then(res => res.json())
      .then(setSpots)
      .catch(() => setError('Failed to load community spots'))
      .finally(() => setLoading(false));
  }, [spotSource]);

  // Handle map click for selecting a new spot position
  const handleMapClick = (e) => {
    if (selectingPosition && onSelectPosition) {
      const { lat, lng } = e.latlng;
      onSelectPosition({ lat, lng });
    }
  };

  useImperativeHandle(ref, () => ({
    setSpotSource,
  }));

  return (
    <div className="relative h-full w-full">
      {/* Spot source toggle */}
      <div className="flex gap-2 mb-2 absolute right-2 top-2 z-[1100]">
        <button
          className={`px-3 py-1 rounded-l ${spotSource === 'osm' ? 'bg-accent text-white' : 'bg-white text-darkblue border'}`}
          onClick={() => setSpotSource('osm')}
        >
          OSM Spots
        </button>
        <button
          className={`px-3 py-1 rounded-r ${spotSource === 'community' ? 'bg-accent text-white' : 'bg-white text-darkblue border'}`}
          onClick={() => setSpotSource('community')}
        >
          Community Spots
        </button>
      </div>
      {/* Map style toggle button - always top right, above map */}
      <button
        className="absolute bottom-3 right-2 z-[1100] bg-darkblue rounded-3xl text-white px-4 py-2 shadow-xl hover:bg-white hover:text-darkblue transition"
        style={{ minWidth: 120 }}
        onClick={() => setMapStyle(mapStyle === 'urban' ? 'satellite' : 'urban')}
      >
        {mapStyle === 'urban' ? 'Urban View' : 'Satellite View'}
      </button>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-[70vh] w-full rounded-lg shadow mapcomponent"
        scrollWheelZoom={true}
        whenCreated={mapInstance => {
          // Remove any previous click listeners
          mapInstance.off('click');
          // Add click listener if in selecting mode
          if (selectingPosition) {
            mapInstance.on('click', handleMapClick);
          }
        }}
      >
        <TileLayer {...tileLayerProps} />
        <FlyToHandler center={center} zoom={flyToZoom || zoom} />
        {selectingPosition && <SelectPositionHandler selectingPosition={selectingPosition} onSelectPosition={onSelectPosition} />}
        {/* Show marker for selected position when adding a spot */}
        {selectingPosition && selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={customIcon} />
        )}
        {spots
          .filter(spot =>
            (spot.lat !== undefined && spot.lon !== undefined) ||
            (spot.latitude !== undefined && spot.longitude !== undefined)
          )
          .map((spot) => {
            // Normalize coordinates
            const lat = spot.lat !== undefined ? spot.lat : spot.latitude;
            const lon = spot.lon !== undefined ? spot.lon : spot.longitude;
            return (
              <Marker key={spot.id || spot._id} position={[lat, lon]} icon={customIcon}>
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
                    <div className="font-bold text-gray-700 text-lg ml-3 md:ml-0 mb-1 truncate">{spot.name || 'Workout Spot'}</div>
                    {spot.tags?.sport && <div className="text-xs text-gray-500 mb-1 ml-3 md:ml-0"><b>Sport:</b> {spot.tags.sport}</div>}
                    {spot.tags?.leisure && <div className="text-xs text-gray-500 mb-1 ml-3 md:ml-0"><b>Type:</b> {spot.tags.leisure}</div>}
                    {spot.tags?.fitness_station && <div className="text-xs text-gray-500 mb-1 ml-3 md:ml-0"><b>Equipment:</b> {spot.tags.fitness_station}</div>}
                    <div className="flex flex-col items-center justify-center mt-4">
                    
                      <a href={spot.osmUrl} hidden={spotSource === 'community'} target="_blank" rel="noopener noreferrer" className=" bg-[#abd65c] text-xs font-medium px-2 py-1 mb-2 rounded hover:bg-green-500 transition">OSM</a>
                      <a
                        className="text-xs bg-[#4285F4] text-white no-underline rounded px-2 py-1 hover:bg-[#97baf4] transition"
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Maps ⌕
                      </a>
                      <button
                        className="mt-2 text-xs bg-gray-600 text-white rounded px-2 py-1 hover:bg-gray-700 transition"
                        onClick={() => setOpenReviewsSpot(spot)}
                        hidden={spotSource === 'osm'}
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
                          <button type="submit" className="text-xs px-2 py-1 rounded bg-gray-600 text-white text-normal hover:bg-gray-700 transition">Save</button>
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
            );
          })}
      </MapContainer>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {/* Reviews & Gallery Modal */}
      {openReviewsSpot && (
        <div className="fixed inset-0 z-[2000] bg-[#364153c0] rounded-3xl flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500 font-bold z-10"
              onClick={() => setOpenReviewsSpot(null)}
              aria-label="Close reviews panel"
            >
              &times;
            </button>
            <SpotReviewsPanel spot={openReviewsSpot} />
          </div>
        </div>
      )}
    </div>
  );
});

export default MapComponent;