import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import '../styles/report.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
});

const LocationMarker: React.FC<{
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Issue location</Popup>
    </Marker>
  );
};

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
  });

  // Default to Kisii coordinates
  const defaultPosition: [number, number] = [-0.6753, 34.7744];

  useEffect(() => {
    // Auto-detect GPS location
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setGpsLoading(false);
        },
        (error) => {
          console.log('GPS error:', error);
          setPosition(defaultPosition);
          setGpsLoading(false);
        }
      );
    } else {
      setPosition(defaultPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (!position) {
      setError('Please select a location on the map');
      return;
    }

    try {
      setLoading(true);
      const response = await api.createIssue({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        longitude: position[1],
        latitude: position[0],
        address: formData.address || 'Selected location',
      });

      if (response.data.success) {
        setSuccess('Issue reported successfully!');
        setTimeout(() => {
          navigate(`/issues/${response.data.issue._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to report issue. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'roads',
    'water',
    'waste',
    'drainage',
    'lighting',
    'health',
    'education',
    'other',
  ];

  return (
    <div className="report-issue-page">
      <div className="container">
        <div className="report-header">
          <h1>Report a County Issue</h1>
          <p>Help us improve Kisii County by reporting problems you've noticed</p>
        </div>

        <div className="report-content">
          <div className="report-form-section">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <label htmlFor="title">
                  Issue Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Pothole on Main Street"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Issue Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  required
                ></textarea>
                <small>{formData.description.length}/500 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address / Landmark</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., Near Kisii High School"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || gpsLoading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>

          <div className="map-section">
            <h3>
              {gpsLoading ? 'Loading your location...' : 'Select Issue Location'}
            </h3>
            <p className="map-instructions">
              Click on the map to pin your issue location. GPS location detected
              automatically.
            </p>

            {position ? (
              <>
                <MapContainer
                  center={position}
                  zoom={13}
                  className="issue-map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
                <div className="coordinates-display">
                  <p>
                    <strong>Latitude:</strong> {position[0].toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {position[1].toFixed(6)}
                  </p>
                </div>
              </>
            ) : (
              <div className="map-loading">
                <div className="spinner"></div>
                <p>Initializing map...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
