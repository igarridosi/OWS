// Functions to interact with YOUR Laravel backend API

// Service for interacting with backend API (Laravel, future use)

/**
 * Fetch calisthenics/street workout spots for a given bounding box.
 * In production, this should call the Laravel backend API.
 * For prototyping, this fetches directly from Overpass API (handle CORS/rate limits carefully).
 * @param {object} bounds - Leaflet LatLngBounds object
 * @returns {Promise<Array>} Array of spot objects: { id, lat, lon, name, osmUrl }
 */
export async function fetchSpotsByBounds(bounds) {
  // bounds: { getSouthWest: () => {lat, lng}, getNorthEast: () => {lat, lng} }
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

  // Overpass QL query for calisthenics/fitness spots
  const query = `
    [out:json][timeout:25];
    (
      node["sport"="calisthenics"](${bbox});
      node["leisure"="fitness_station"](${bbox});
      node["fitness_station"="horizontal_bar"](${bbox});
      way["sport"="calisthenics"](${bbox});
      way["leisure"="fitness_station"](${bbox});
      way["fitness_station"="horizontal_bar"](${bbox});
    );
    out center tags;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch spots');
    const data = await response.json();
    // Normalize Overpass elements to spot objects
    return (data.elements || []).map((el) => ({
      id: el.id,
      lat: el.lat || (el.center && el.center.lat),
      lon: el.lon || (el.center && el.center.lon),
      name: el.tags && (el.tags.name || el.tags.operator || null),
      osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      tags: el.tags || {},
    })).filter(spot => spot.lat && spot.lon);
  } catch (error) {
    // Optionally log error
    return [];
  }
}

export async function fetchSpotReviews(spotId) {
  const res = await fetch(`/api/spots/${spotId}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function postSpotReview(spotId, review) {
  const res = await fetch(`/api/spots/${spotId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to post review');
  return res.json();
}