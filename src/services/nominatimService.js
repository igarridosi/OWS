// Service for interacting with Nominatim API

export async function geocodeCity(cityName) {
  // Use Nominatim API to geocode a city name
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    // Optionally log error
    return null;
  }
}

/**
 * Reverse geocode: Get address info for given latitude and longitude using Nominatim API.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object|null>} Address result or null on error
 */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const data = await response.json();
    return data;
  } catch (error) {
    // Optionally log error
    return null;
  }
}
