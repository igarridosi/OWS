import React, { useState } from 'react';
import { getUserFromToken } from '../../utils/helpers';
const API_URL = import.meta.env.VITE_API_URL;

const SpotReviewsPanel = ({ spot }) => {
  if (!spot) return null;
  const { name, description, imageUrl, lat, lng, _id, id } = spot;
  const spotId = _id || id;

  // Local state for reviews
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Get current user (from JWT, for id)
  const currentUser = getUserFromToken();

  // Fetch reviews on mount
  React.useEffect(() => {
    if (!spotId) return;
    setLoading(true);
    setError('');
    fetch(`${API_URL}/spots/${spotId}/reviews`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [spotId]);

  // Check if user already reviewed this spot
  const userReview = currentUser && reviews.find(r => r.userId === currentUser.id);

  // Handle review submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !rating) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ text: reviewText, rating })
      });
      if (!res.ok) throw new Error('Failed to post review');
      const newReview = await res.json();
      // Replace or add the user's review in the reviews array
      setReviews(prev => {
        const filtered = prev.filter(r => r.userId !== newReview.userId);
        return [newReview, ...filtered];
      });
      setReviewText('');
      setRating(0);
    } catch {
      setError('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // Render stars for average
  const renderStars = (value) => (
    <span className="text-yellow-400 text-lg">
      {[1,2,3,4,5].map(i => (
        <span key={i}>{i <= value ? '★' : '☆'}</span>
      ))}
    </span>
  );

  // Helper to get display name for a review
  const getDisplayName = (review) => {
    if (review.userVisibility === 'public' && review.userName) return review.userName;
    return 'OWS User';
  };

  return (
    <div className="p-6 m-2">
      <h2 className="text-xl font-bold mb-2">Reviews & Gallery</h2>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="w-full max-w-xs rounded-lg mb-4 object-cover"
          style={{ maxHeight: 240 }}
        />
      )}
      <div className="mb-2">
        <div className="font-bold text-lg">{name}</div>
        <div className="text-gray-700">{description}</div>
        <div className="text-xs text-gray-500 mt-2">
          Lat: {lat} | Lon: {lng}
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 mt-2">
            {renderStars(Math.round(avgRating))}
            <span className="text-gray-700 font-bold">{avgRating} / 5</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Add a Review</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={2}
            placeholder={currentUser ? "Write your review..." : "Login to write a review"}
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            disabled={submitting || !!userReview || !currentUser}
          />
          <div className="flex items-center gap-2">
            <span className="font-bold">Your Rating:</span>
            {[1,2,3,4,5].map(i => (
              <button
                type="button"
                key={i}
                className={`text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(i)}
                tabIndex={-1}
                disabled={submitting || !!userReview || !currentUser}
              >
                ★
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="px-4 py-1 rounded bg-accent text-white font-bold hover:bg-darkblue disabled:opacity-60"
            disabled={submitting || !reviewText.trim() || !rating || !!userReview || !currentUser}
          >
            {!currentUser ? 'Login to review' : userReview ? 'You already reviewed' : (submitting ? 'Posting...' : 'Post Review')}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <h3 className="font-bold mb-2">Reviews</h3>
        {loading ? (
          <div className="text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-400 italic">No reviews yet.</div>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {reviews.map((r, i) => (
              <li key={r._id || r.id || i} className="bg-gray-100 rounded p-2 text-sm flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  {renderStars(r.rating || 0)}
                  <span className="text-xs text-gray-500">{r.rating ? `${r.rating}/5` : ''}</span>
                  <span className="ml-auto text-xs font-semibold text-darkblue">{r.userName || 'OWS User'}</span>
                </div>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpotReviewsPanel;