import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/officer-dashboard.css';

interface AssignedIssue {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  createdAt: string;
  updates: any[];
  photos: string[];
  reportedBy: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<AssignedIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('issues'); // issues, workload, announcements, notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    enRoute: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
  });

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Photo upload
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchAssignedIssues();
    fetchNotifications();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      setLoading(true);
      const response = await api.getAssignedIssues();
      const issues = response.data.issues || [];
      setAssignedIssues(issues);

      // Calculate stats
      const statsCalc = {
        total: issues.length,
        enRoute: issues.filter((i: any) => i.status === 'en_route').length,
        inProgress: issues.filter((i: any) => i.status === 'in_progress').length,
        resolved: issues.filter((i: any) => i.status === 'resolved').length,
        pending: issues.filter((i: any) => i.status === 'assigned' || i.status === 'verified').length,
      };
      setStats(statsCalc);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assigned issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const notifs = response.data.notifications || [];
      setNotifications(notifs);
      
      // Get unread count
      const countResponse = await api.get('/notifications/count/unread');
      setNotificationCount(countResponse.data.count || 0);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedIssue || !newStatus) return;

    try {
      setSubmittingStatus(true);
      setError('');
      setSuccessMessage('');

      await api.put(`/issues/${selectedIssue._id}/status`, {
        status: newStatus,
        comment,
        photos: photoPreviewUrls,
      });

      setSuccessMessage('Issue status updated successfully!');
      setSelectedIssue(null);
      setNewStatus('');
      setComment('');
      setPhotoFiles([]);
      setPhotoPreviewUrls([]);

      // Refresh issues and notifications
      fetchAssignedIssues();
      fetchNotifications();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !comment) return;

    try {
      setSubmittingStatus(true);
      setError('');

      await api.post(`/issues/${selectedIssue._id}/comments`, {
        comment,
        photos: photoPreviewUrls,
      });

      setComment('');
      setPhotoFiles([]);
      setPhotoPreviewUrls([]);

      // Refresh the selected issue
      const response = await api.get(`/issues/${selectedIssue._id}`);
      setSelectedIssue(response.data.issue);
      setSuccessMessage('Comment added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles([...photoFiles, ...files]);

      // Create preview URLs
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setNotificationCount(Math.max(0, notificationCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      assigned: 'badge-primary',
      pending: 'badge-warning',
      verified: 'badge-info',
      en_route: 'badge-secondary',
      in_progress: 'badge-info',
      resolved: 'badge-success',
    };
    return statusMap[status] || 'badge-default';
  };

  if (loading) {
    return (
      <div className="officer-dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="officer-dashboard">
      <div className="dashboard-header">
        <h1> Officer Dashboard</h1>
        <p>Welcome, {user?.firstName} {user?.lastName}! Manage your assigned issues and announcements.</p>
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

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.enRoute}</div>
          <div className="stat-label">En Route</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">✓ Resolved</div>
        </div>
        {notificationCount > 0 && (
          <div className="stat-card notification-badge">
            <div className="stat-number">{notificationCount}</div>
            <div className="stat-label">New Notifications</div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
           Issues ({stats.total})
        </button>
        <button
          className={`tab-btn ${activeTab === 'workload' ? 'active' : ''}`}
          onClick={() => setActiveTab('workload')}
        >
           Workload
        </button>
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
           Announcements
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
           Notifications {notificationCount > 0 && `(${notificationCount})`}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="issues-section">
            <div className="issues-list">
              <h2>Assigned Issues</h2>
              {assignedIssues.length === 0 ? (
                <div className="no-data">
                  <p>No issues assigned yet. Check back soon!</p>
                </div>
              ) : (
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedIssues.map((issue) => (
                      <tr key={issue._id}>
                        <td className="issue-title">{issue.title}</td>
                        <td>{issue.category}</td>
                        <td>
                          <span className={`badge badge-${issue.priority}`}>
                            {issue.priority.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
                            {issue.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setNewStatus(issue.status);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Issue Details Modal */}
            {selectedIssue && (
              <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                <div className="issue-details-modal" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setSelectedIssue(null);
                      setComment('');
                      setPhotoFiles([]);
                      setPhotoPreviewUrls([]);
                    }}
                  >
                    ✕
                  </button>

                  <h3>{selectedIssue.title}</h3>

                  <div className="detail-row">
                    <label>Category:</label>
                    <span>{selectedIssue.category.toUpperCase()}</span>
                  </div>

                  <div className="detail-row">
                    <label>Priority:</label>
                    <span className={`badge badge-${selectedIssue.priority}`}>
                      {selectedIssue.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="detail-row">
                    <label>Description:</label>
                    <p>{selectedIssue.description}</p>
                  </div>

                  <div className="detail-row">
                    <label>Location:</label>
                    <p>
                      <strong>Address:</strong> {selectedIssue.location?.address}
                      <br />
                      <strong>Coordinates:</strong> ({selectedIssue.location?.coordinates[0]?.toFixed(6)},
                      {selectedIssue.location?.coordinates[1]?.toFixed(6)})
                    </p>
                  </div>

                  <div className="detail-row">
                    <label>Reported By:</label>
                    <p>
                      {selectedIssue.reportedBy?.firstName} {selectedIssue.reportedBy?.lastName}
                      <br />
                      📧 {selectedIssue.reportedBy?.email}
                      <br />
                      📱 {selectedIssue.reportedBy?.phone}
                    </p>
                  </div>

                  <div className="detail-row">
                    <label>Current Status:</label>
                    <span className={`badge ${getStatusBadgeClass(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Previous Updates */}
                  {selectedIssue.updates && selectedIssue.updates.length > 0 && (
                    <div className="detail-row">
                      <label>Update History:</label>
                      <div className="updates-list">
                        {selectedIssue.updates.map((update: any, idx: number) => (
                          <div key={idx} className="update-item">
                            {update.status && (
                              <p>
                                <strong>Status:</strong> {update.status}
                              </p>
                            )}
                            {update.comment && (
                              <p>
                                <strong>Comment:</strong> {update.comment}
                              </p>
                            )}
                            {update.photos && update.photos.length > 0 && (
                              <p>
                                <strong>Photos:</strong> {update.photos.length} attached
                              </p>
                            )}
                            <small>{new Date(update.timestamp).toLocaleString()}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update Form */}
                  <div className="status-update-form">
                    <h4>Update Issue Status</h4>

                    <div className="form-group">
                      <label>New Status:</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="assigned">Assigned</option>
                        <option value="en_route">En Route</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Comment or Resolution Note:</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment, resolution details, or update..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label>Upload Photos:</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="file-input"
                      />
                      {photoPreviewUrls.length > 0 && (
                        <div className="photo-preview">
                          {photoPreviewUrls.map((url, idx) => (
                            <div key={idx} className="photo-item">
                              <img src={url} alt={`Preview ${idx}`} />
                              <button
                                type="button"
                                className="remove-photo"
                                onClick={() => removePhoto(idx)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleStatusUpdate}
                      disabled={submittingStatus || !newStatus}
                    >
                      {submittingStatus ? '⏳ Updating...' : '✓ Update Status'}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        if (comment || photoFiles.length > 0) {
                          handleAddComment();
                        }
                      }}
                      disabled={submittingStatus || (!comment && photoFiles.length === 0)}
                    >
                      {submittingStatus ? '⏳ Adding...' : '💬 Add Comment Only'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && (
          <div className="workload-section">
            <h2> Your Workload Summary</h2>
            <div className="workload-grid">
              <div className="workload-card">
                <h3>Pending Tasks</h3>
                <div className="workload-number">{stats.pending}</div>
                <p>Assigned but not yet started</p>
              </div>
              <div className="workload-card">
                <h3>Currently Working</h3>
                <div className="workload-number">{stats.enRoute + stats.inProgress}</div>
                <p>En Route or In Progress</p>
              </div>
              <div className="workload-card success">
                <h3>Completed</h3>
                <div className="workload-number">{stats.resolved}</div>
                <p>✓ Resolved issues</p>
              </div>
              <div className="workload-card">
                <h3>Completion Rate</h3>
                <div className="workload-number">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </div>
                <p>Of assigned issues</p>
              </div>
            </div>

            <div className="workload-details">
              <h3>Recent Activity</h3>
              {assignedIssues.slice(0, 5).map((issue) => (
                <div key={issue._id} className="activity-item">
                  <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className="activity-title">{issue.title}</span>
                  <span className="activity-date">{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="announcements-section">
            <h2> Manage Your Announcements</h2>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/officer/announcements/create')}
            >
              ➕ Create New Announcement
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/officer/announcements')}
            >
              📋 View All My Announcements
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <h2> Your Notifications</h2>
            {notifications.length === 0 ? (
              <div className="no-data">
                <p>No notifications yet. You're all caught up!</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notification-header">
                      <h4>{notif.title}</h4>
                      {!notif.isRead && (
                        <button
                          className="mark-read-btn"
                          onClick={() => markNotificationAsRead(notif._id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
