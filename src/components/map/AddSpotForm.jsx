import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const initialState = {
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  image: null,
};

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dcebtp9ie/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'calisthenics_hub';

const AddSpotForm = ({ onSubmit, onCancel, latlng }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When latlng changes, update form coordinates
  useEffect(() => {
    if (latlng) {
      setForm((prev) => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
    }
  }, [latlng]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.latitude || !form.longitude) {
      setError('Name and location are required.');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (form.image) {
        // Upload image to Cloudinary
        const imgData = new FormData();
        imgData.append('file', form.image);
        imgData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: imgData,
        });
        const data = await res.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          setError('Image upload failed.');
          setSubmitting(false);
          return;
        }
      }
      // Prepare spot data
      const spotData = {
        name: form.name,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
        imageUrl,
      };
      if (onSubmit) await onSubmit(spotData);
      setForm(initialState);
    } catch (err) {
      setError('Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-darkblue rounded-xl shadow-lg p-6 flex flex-col gap-4 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-2 text-white">Add New Spot</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <label className="flex flex-col gap-1 text-white font-extrabold">
        <p>Name<span className="text-red-500"> *</span></p>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded px-2 py-1"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-white font-extrabold">
        <p>Description</p>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="border rounded px-2 py-1"
          rows={2}
        />
      </label>
      {/* Show selected coordinates, not editable */}
      {latlng && (
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1 text-white font-extrabold">
            <p>Latitude</p>
            <input
              type="number"
              name="latitude"
              value={latlng.lat}
              className="border rounded px-2 py-1 w-[30vw] md:w-[10vw] bg-gray-100 text-gray-700"
              disabled
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-white font-extrabold">
            <p>Longitude</p>
            <input
              type="number"
              name="longitude"
              value={latlng.lng}
              className="border rounded px-2 py-1 w-[30vw] md:w-[10vw] bg-gray-100 text-gray-700"
              disabled
            />
          </div>
        </div>
      )}
      <label className="flex flex-col gap-1 text-white font-extrabold">
        <p>Image<span className="text-red-500"> *</span></p>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="border rounded px-2 py-1"
          required
        />
      </label>
      <div className="flex gap-2 mt-2">
        <Button type="submit" className='px-4 py-2 bg-accent text-white block rounded hover:bg-accent transition-colors disabled:opacity-60' disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
        )}
      </div>
    </form>
  );
};

export default AddSpotForm;
