import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Change if your backend runs elsewhere
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (logoutHandler) logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;

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
  const res = await api.get(`/spots/${spotId}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.data;
}

export async function postSpotReview(spotId, review) {
  const res = await api.post(`/spots/${spotId}/reviews`, review);
  if (!res.ok) throw new Error('Failed to post review');
  return res.data;
}

export async function fetchCurrentUser() {
  try {
    const res = await api.get('/users/me');
    return res.data;
  } catch (err) {
    return null;
  }
}

// Community API
export async function getCountries() {
  const res = await api.get('/community/countries');
  return res.data;
}

export async function joinCountry(countryId) {
  const res = await api.post(`/community/countries/${countryId}/join`);
  return res.data;
}

export async function getChannels(countryId) {
  const res = await api.get(`/community/countries/${countryId}/channels`);
  return res.data;
}

export async function createCountry(data) {
  const res = await api.post('/community/countries', data);
  return res.data;
}

export async function createChannel(countryId, data) {
  const res = await api.post(`/community/countries/${countryId}/channels`, data);
  return res.data;
}

export async function getMessages(channelId) {
  const res = await api.get(`/community/channels/${channelId}/messages`);
  return res.data;
}

export async function postMessage(channelId, content) {
  const res = await api.post(`/community/channels/${channelId}/messages`, { content });
  return res.data;
}

export async function getJoinedCountries() {
  const res = await api.get('/community/countries/joined');
  return res.data;
}

// Admin: Delete country
export async function deleteCountry(countryId) {
  const res = await api.delete(`/community/countries/${countryId}`);
  return res.data;
}

// Admin: Edit country
export async function editCountry(countryId, data) {
  const res = await api.patch(`/community/countries/${countryId}`, data);
  return res.data;
}

// Admin: Delete channel
export async function deleteChannel(countryId, channelId) {
  const res = await api.delete(`/community/countries/${countryId}/channels/${channelId}`);
  return res.data;
}

// Admin: Edit channel
export async function editChannel(countryId, channelId, data) {
  const res = await api.patch(`/community/countries/${countryId}/channels/${channelId}`, data);
  return res.data;
}

// Admin: Delete message
export async function deleteMessage(channelId, messageId) {
  const res = await api.delete(`/community/channels/${channelId}/messages/${messageId}`);
  return res.data;
}

// Admin: Block/unblock user
export async function blockUser(userId) {
  const res = await api.post(`/community/users/${userId}/block`);
  return res.data;
}

export async function unblockUser(userId) {
  const res = await api.post(`/community/users/${userId}/unblock`);
  return res.data;
}

// Admin: List users in a country
export async function getCountryUsers(countryId) {
  const res = await api.get(`/community/countries/${countryId}/users`);
  return res.data;
}

// Admin: List all users (for global block)
export async function getAllCommunityUsers() {
  const res = await api.get(`/community/users`);
  return res.data;
}

// Leave a country/community
export async function leaveCountry(countryId) {
  const res = await api.delete(`/community/countries/${countryId}/leave`);
  return res.data;
}

// Community Spot Inbox (Moderation)
export async function submitCommunitySpotInbox(data) {
  const res = await api.post('/community/spots/inbox', data);
  return res.data;
}

export async function getCommunitySpotInbox() {
  const res = await api.get('/community/spots/inbox');
  return res.data;
}

export async function approveCommunitySpotInbox(id) {
  const res = await api.post(`/community/spots/inbox/${id}/approve`);
  return res.data;
}

export async function rejectCommunitySpotInbox(id) {
  const res = await api.post(`/community/spots/inbox/${id}/reject`);
  return res.data;
}