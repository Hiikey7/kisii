import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/officer-management.css';

interface Officer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  canCreateAnnouncement: boolean;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
}

export const OfficerManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Officers list
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPermission, setFilterPermission] = useState<'all' | 'enabled' | 'disabled'>('all');
  
  // Create new officer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newOfficer, setNewOfficer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    canCreateAnnouncement: true,
  });

  // Edit officer
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
    } else {
      fetchOfficers();
      fetchDepartments();
    }
  }, [user, navigate]);

  useEffect(() => {
    filterOfficers();
  }, [officers, searchTerm, filterPermission]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/officers/with-permissions');
      setOfficers(response.data.officers || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load departments', err);
    }
  };

  const filterOfficers = () => {
    let filtered = officers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        officer =>
          officer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Permission filter
    if (filterPermission === 'enabled') {
      filtered = filtered.filter(officer => officer.canCreateAnnouncement);
    } else if (filterPermission === 'disabled') {
      filtered = filtered.filter(officer => !officer.canCreateAnnouncement);
    }

    setFilteredOfficers(filtered);
  };

  const handleCreateOfficer = async () => {
    try {
      if (!newOfficer.firstName || !newOfficer.lastName || !newOfficer.email || !newOfficer.phone || !newOfficer.department) {
        setError('Please fill all required fields');
        return;
      }

      setLoading(true);
      await api.post('/admin/users/create', {
        firstName: newOfficer.firstName,
        lastName: newOfficer.lastName,
        email: newOfficer.email,
        phone: newOfficer.phone,
        role: 'officer',
        department: newOfficer.department,
      });

      setSuccessMessage('Field officer created successfully!');
      setNewOfficer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        canCreateAnnouncement: true,
      });
      setShowCreateModal(false);
      fetchOfficers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create officer');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnnouncementPermission = async (officerId: string, currentPermission: boolean) => {
    try {
      setLoading(true);
      await api.put(`/admin/officers/${officerId}/announcement-permission`, {
        canCreateAnnouncement: !currentPermission,
      });

      setSuccessMessage(`Announcement permission ${!currentPermission ? 'enabled' : 'disabled'} successfully!`);
      fetchOfficers();
      setSelectedOfficer(null);
      setShowPermissionModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateOfficer = async (officerId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this officer?')) return;

    try {
      setLoading(true);
      await api.put(`/admin/users/${officerId}/deactivate`);
      setSuccessMessage('Officer deactivated successfully!');
      fetchOfficers();
      setSelectedOfficer(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate officer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="officer-management">
      <div className="page-header">
        <h1>👮 Field Officer Management</h1>
        <p>Create and manage field officers, control their announcement permissions</p>
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

      {/* Create Officer Button */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create New Officer
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterPermission === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPermission('all')}
          >
            All Officers
          </button>
          <button
            className={`filter-btn ${filterPermission === 'enabled' ? 'active' : ''}`}
            onClick={() => setFilterPermission('enabled')}
          >
            ✓ Announcement Enabled
          </button>
          <button
            className={`filter-btn ${filterPermission === 'disabled' ? 'active' : ''}`}
            onClick={() => setFilterPermission('disabled')}
          >
            ✕ Announcement Disabled
          </button>
        </div>
      </div>

      {/* Officers List */}
      <div className="officers-list">
        {loading && filteredOfficers.length === 0 ? (
          <div className="loading">Loading officers...</div>
        ) : filteredOfficers.length === 0 ? (
          <div className="empty-state">
            <p>No field officers found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="officers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Announcement Permission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map(officer => (
                  <tr key={officer._id}>
                    <td>{officer.firstName} {officer.lastName}</td>
                    <td>{officer.email}</td>
                    <td>{officer.phone}</td>
                    <td>{officer.department?.name || 'N/A'}</td>
                    <td>
                      <span className={`permission-badge ${officer.canCreateAnnouncement ? 'enabled' : 'disabled'}`}>
                        {officer.canCreateAnnouncement ? '✓ Enabled' : '✕ Disabled'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${officer.isActive ? 'active' : 'inactive'}`}>
                        {officer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-small btn-info"
                        onClick={() => {
                          setSelectedOfficer(officer);
                          setShowPermissionModal(true);
                        }}
                      >
                        📝 Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Officer Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Field Officer</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={newOfficer.firstName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={newOfficer.lastName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={newOfficer.department}
                  onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newOfficer.canCreateAnnouncement}
                    onChange={(e) => setNewOfficer({ ...newOfficer, canCreateAnnouncement: e.target.checked })}
                  />
                  Allow to create announcements
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateOfficer} disabled={loading}>
                {loading ? 'Creating...' : 'Create Officer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedOfficer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Manage Officer Permissions</h2>
              <button className="close-btn" onClick={() => setShowPermissionModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="officer-details">
                <p><strong>Name:</strong> {selectedOfficer.firstName} {selectedOfficer.lastName}</p>
                <p><strong>Email:</strong> {selectedOfficer.email}</p>
                <p><strong>Department:</strong> {selectedOfficer.department?.name || 'N/A'}</p>
              </div>
              <div className="permission-section">
                <h3>Announcement Permission</h3>
                <p className="permission-description">
                  {selectedOfficer.canCreateAnnouncement
                    ? 'This officer can currently create and publish announcements.'
                    : 'This officer cannot create announcements.'}
                </p>
                <button
                  className={`btn ${selectedOfficer.canCreateAnnouncement ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => handleToggleAnnouncementPermission(selectedOfficer._id, selectedOfficer.canCreateAnnouncement)}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : (selectedOfficer.canCreateAnnouncement ? 'Disable' : 'Enable')} Announcement Permission
                </button>
              </div>
              <div className="deactivate-section">
                <h3>Account Status</h3>
                {selectedOfficer.isActive ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeactivateOfficer(selectedOfficer._id)}
                    disabled={loading}
                  >
                    {loading ? 'Deactivating...' : 'Deactivate Officer'}
                  </button>
                ) : (
                  <p className="inactive-notice">This officer's account is deactivated.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPermissionModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerManagement;
