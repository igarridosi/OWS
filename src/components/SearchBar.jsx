import React, { useState } from 'react';
import { geocodeCity, reverseGeocode } from '../services/nominatimService';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Button from './common/Button';

const SearchBar = ({ onLocationSelect, userSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);

  // Handle search for city/location using Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`Geocoding city: ${trimmedQuery}`);
      // Add a slight delay to respect Nominatim policy
      await new Promise(resolve => setTimeout(resolve, 250));
      const result = await geocodeCity(trimmedQuery);
      // Accept if address contains city, town, or village
      const address = result && result.address;
      if (
        result &&
        result.lat &&
        result.lon &&
        address &&
        (address.city || address.town || address.village)
      ) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        // Extract only the city/town/village for display
        const displayName = address.city || address.town || address.village || trimmedQuery;
        console.log(`Geocoded "${trimmedQuery}" to: ${displayName} [${lat}, ${lon}]`);
        // Use a more appropriate zoom based on result type/importance
        let zoomLevel = 13;
        if (result.importance > 0.7) zoomLevel = 11;
        if (result.type === 'city' || result.type === 'administrative') zoomLevel = 12;
        onLocationSelect(lat, lon, zoomLevel, displayName);
      } else {
        setError('Please enter a valid city name. Only cities, towns, or villages are allowed.');
      }
    } catch (err) {
      setError('Failed to search location.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 'Locate Me' button click
  const handleLocateMe = async () => {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await reverseGeocode(latitude, longitude);
          let zoomLevel = 13;
          if (result?.address?.city || result?.address?.town || result?.address?.village) {
            zoomLevel = 12;
          }
          onLocationSelect(latitude, longitude, zoomLevel);
        } catch (e) {
          setError('Could not determine your city.');
        }
        setLocating(false);
      },
      (err) => {
        setError('Location permission denied or unavailable.');
        setLocating(false);
      }
    );
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col items-center md:items-start justify-center w-full">
      <h1 className="text-2xl font-extrabold text-darkblue drop-shadow-lg mb-4 ">
        {userSearch ? `Workout Spots in ${userSearch}...` : 'Find Workout Spots'}
      </h1>
      <div className="flex w-full max-w-xl relative bg-white rounded-xl shadow-md md:px-2 py-2 md:gap-2 items-center border border-gray-200 focus-within:ring-2 focus-within:ring-accent transition">
        <input
          type="text"
          className="flex-1 border-none bg-transparent font-normal outline-none px-2 py-2 text-sm md:text-lg placeholder-darkblue"
          placeholder="Search for a city or location"
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={loading || locating}
        />
        <Button type="submit" disabled={loading || locating || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <button
          type="button"
          className="ml-1 p-2 rounded-full right-3 absolute md:block bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition flex items-center justify-center disabled:opacity-50"
          title="Locate Me"
          onClick={handleLocateMe}
          hidden={locating || loading}
        >
          <span className="sr-only">Locate Me</span>
          {/* Inline SVG for crosshairs icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v2m0 8v2m6-6h-2M8 12H6" /></svg>
        </button>
        {(loading || locating) && <LoadingSpinner />}
      </div>
      {error && <ErrorMessage message={error} />}   
    </form>
  );
};

export default SearchBar;