import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/announcement.css';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  content: string;
  status: string;
  author: {
    firstName: string;
    lastName: string;
  };
  visibleTo: string;
  createdAt: string;
  publishedAt: string;
  viewCount: number;
}

export const OfficerAnnouncementManage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    visibleTo: 'all',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyAnnouncements();
  }, []);

  const fetchMyAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements/user/my-announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      content: announcement.content,
      visibleTo: announcement.visibleTo,
    });
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement || !formData.title || !formData.description || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await api.put(`/announcements/${editingAnnouncement._id}`, formData);
      
      setSuccessMessage('Announcement updated successfully!');
      setEditingAnnouncement(null);
      fetchMyAnnouncements();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (announcementId: string) => {
    if (!window.confirm('Are you sure you want to archive this announcement?')) return;

    try {
      setSubmitting(true);
      setError('');
      
      await api.put(`/announcements/${announcementId}/archive`);
      
      setSuccessMessage('Announcement archived successfully!');
      setSelectedAnnouncement(null);
      fetchMyAnnouncements();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;

    try {
      setSubmitting(true);
      setError('');
      
      await api.delete(`/announcements/${announcementId}`);
      
      setSuccessMessage('Announcement deleted successfully!');
      setSelectedAnnouncement(null);
      fetchMyAnnouncements();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: 'badge-warning',
      published: 'badge-success',
      archived: 'badge-secondary',
    };
    return statusMap[status] || 'badge-default';
  };

  if (loading) {
    return (
      <div className="announcement-manage">
        <div className="loading">Loading your announcements...</div>
      </div>
    );
  }

  return (
    <div className="announcement-manage">
      <div className="page-header">
        <h1>📢 Manage My Announcements</h1>
        <p>Create, edit, and manage announcements visible to all visitors.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          ✕ {error}
          <button onClick={() => setError('')}>Close</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          ✓ {successMessage}
          <button onClick={() => setSuccessMessage('')}>Close</button>
        </div>
      )}

      <div className="action-buttons">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/officer/announcements/create')}>
          ➕ Create New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="announcements-grid">
        {announcements.length === 0 ? (
          <div className="no-data">
            <p>You haven't created any announcements yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/officer/announcements/create')}>
              Create Your First Announcement
            </button>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              <div className="card-header">
                <h3>{announcement.title}</h3>
                <span className={`badge ${getStatusBadgeClass(announcement.status)}`}>
                  {announcement.status.toUpperCase()}
                </span>
              </div>

              <p className="card-description">{announcement.description}</p>

              <div className="card-meta">
                <span>📅 {new Date(announcement.createdAt).toLocaleDateString()}</span>
                <span>👁️ {announcement.viewCount} views</span>
                <span>🌐 {announcement.visibleTo}</span>
              </div>

              <div className="card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  View Details
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(announcement)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => handleArchive(announcement._id)}
                >
                  Archive
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(announcement._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal */}
      {selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedAnnouncement(null)}>
              ✕
            </button>

            <h2>{selectedAnnouncement.title}</h2>

            <div className="detail-meta">
              <span className={`badge ${getStatusBadgeClass(selectedAnnouncement.status)}`}>
                {selectedAnnouncement.status.toUpperCase()}
              </span>
              <span>👁️ {selectedAnnouncement.viewCount} views</span>
              <span>🌐 Visible to: {selectedAnnouncement.visibleTo}</span>
            </div>

            <p className="description">{selectedAnnouncement.description}</p>
            <div className="content">{selectedAnnouncement.content}</div>

            <small className="meta-info">
              Created on {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
              {selectedAnnouncement.publishedAt && ` • Published on ${new Date(selectedAnnouncement.publishedAt).toLocaleDateString()}`}
            </small>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAnnouncement && (
        <div className="modal-overlay" onClick={() => setEditingAnnouncement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setEditingAnnouncement(null)}>
              ✕
            </button>

            <h2>Edit Announcement</h2>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full content"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Visible To:</label>
              <select
                value={formData.visibleTo}
                onChange={(e) => setFormData({ ...formData, visibleTo: e.target.value })}
              >
                <option value="all">All Visitors</option>
                <option value="officers">Officers Only</option>
                <option value="citizens">Citizens Only</option>
              </select>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleUpdate}
              disabled={submitting}
            >
              {submitting ? '⏳ Updating...' : '✓ Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
