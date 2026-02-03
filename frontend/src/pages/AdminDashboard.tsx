import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/admin-dashboard.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: any;
  isActive: boolean;
  canCreateAnnouncement?: boolean;
  createdAt: string;
}

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  reportedBy: any;
  assignedTo: any;
  department: any;
  createdAt: string;
  resolvedAt?: string;
}

interface Stats {
  totalUsers: number;
  totalCitizens: number;
  totalOfficers: number;
  totalAdmins: number;
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  completionRate: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dashboard data
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCitizens: 0,
    totalOfficers: 0,
    totalAdmins: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    avgResolutionTime: 0,
    completionRate: 0,
  });

  // Users management
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'citizen',
    department: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);

  // Issues management
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [issuePage, setIssuePage] = useState(1);
  const [issueStatus, setIssueStatus] = useState('');
  const [assignmentOfficer, setAssignmentOfficer] = useState('');
  const [officers, setOfficers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, issuesRes, deptRes, officersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/issues'),
        api.get('/departments'),
        api.get('/admin/officers'),
      ]);

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setIssues(issuesRes.data.issues || []);
      setDepartments(deptRes.data.data || []);
      setOfficers(officersRes.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await api.post('/admin/users/create', newUser);
      setSuccessMessage('User created successfully!');
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'citizen',
        department: '',
      });
      setShowUserModal(false);
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIssue = async (issueId: string, status: string) => {
    try {
      await api.put(`/admin/issues/${issueId}/verify`, { status });
      setSuccessMessage('Issue verified successfully!');
      fetchDashboardData();
      setSelectedIssue(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify issue');
    }
  };

  const handleAssignIssue = async (issueId: string) => {
    if (!assignmentOfficer) {
      setError('Please select an officer');
      return;
    }
    try {
      await api.put(`/admin/issues/${issueId}/assign`, {
        assignedTo: assignmentOfficer,
      });
      setSuccessMessage('Issue assigned successfully!');
      fetchDashboardData();
      setSelectedIssue(null);
      setAssignmentOfficer('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign issue');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await api.get(`/admin/reports/export?format=${format}`, {
        responseType: format === 'pdf' ? 'blob' : 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `county-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      setSuccessMessage('User deactivated successfully!');
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1> Admin Control Panel</h1>
        <p>Welcome, {user?.firstName}! Manage the entire county system.</p>
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

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
           Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
           All Issues
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
           User Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'officers' ? 'active' : ''}`}
          onClick={() => setActiveTab('officers')}
        >
           Field Officers
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
           Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
           Settings
        </button>
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <div className="stat-number">{stats.totalIssues}</div>
                  <div className="stat-label">Total Issues</div>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <div className="stat-number">{stats.pendingIssues}</div>
                  <div className="stat-label">Pending Issues</div>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">✓</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.resolvedIssues}</div>
                  <div className="stat-label">Resolved Issues</div>
                </div>
              </div>
            </div>

            {/* User Breakdown */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#4CAF50' }}>
                  {stats.totalCitizens}
                </div>
                <div className="stat-label"> Citizens</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#2196F3' }}>
                  {stats.totalOfficers}
                </div>
                <div className="stat-label"> Field Officers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#FF9800' }}>
                  {stats.totalAdmins}
                </div>
                <div className="stat-label"> Admins</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#9C27B0' }}>
                  {stats.completionRate}%
                </div>
                <div className="stat-label"> Completion Rate</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowUserModal(true)}
                >
                  ➕ Create New User
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleExportReport('csv')}
                >
                   Export CSV Report
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleExportReport('pdf')}
                >
                   Export PDF Report
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => setActiveTab('issues')}
                >
                   Manage Issues
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="issues-section">
            <h2>County-Wide Issues Management</h2>
            {issues.length === 0 ? (
              <div className="no-data">
                <p>No issues found.</p>
              </div>
            ) : (
              <div className="issues-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Reported By</th>
                      <th>Assigned To</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id}>
                        <td className="issue-title">{issue.title}</td>
                        <td>{issue.category}</td>
                        <td>
                          <span className={`badge badge-${issue.status}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${issue.priority}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td>
                          {issue.reportedBy?.firstName} {issue.reportedBy?.lastName}
                        </td>
                        <td>
                          {issue.assignedTo ? (
                            `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                          ) : (
                            <span style={{ color: '#f44336' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setIssueStatus(issue.status);
                              setAssignmentOfficer(issue.assignedTo?._id || '');
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Issue Details Modal */}
            {selectedIssue && (
              <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedIssue(null)}
                  >
                    ✕
                  </button>

                  <h3>{selectedIssue.title}</h3>

                  <div className="modal-section">
                    <h4>Issue Details</h4>
                    <div className="detail-row">
                      <label>Category:</label>
                      <span>{selectedIssue.category}</span>
                    </div>
                    <div className="detail-row">
                      <label>Priority:</label>
                      <span className={`badge badge-${selectedIssue.priority}`}>
                        {selectedIssue.priority}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Status:</label>
                      <span className={`badge badge-${selectedIssue.status}`}>
                        {selectedIssue.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Description:</label>
                      <p>{selectedIssue.description}</p>
                    </div>
                    <div className="detail-row">
                      <label>Reported By:</label>
                      <p>
                        {selectedIssue.reportedBy?.firstName}{' '}
                        {selectedIssue.reportedBy?.lastName}
                        <br />
                        📧 {selectedIssue.reportedBy?.email}
                        <br />
                        📱 {selectedIssue.reportedBy?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Verify & Assign</h4>
                    <div className="form-group">
                      <label>Verify Status:</label>
                      <select
                        value={issueStatus}
                        onChange={(e) => setIssueStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="assigned">Assigned</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Assign to Officer:</label>
                      <select
                        value={assignmentOfficer}
                        onChange={(e) => setAssignmentOfficer(e.target.value)}
                      >
                        <option value="">-- Select Officer --</option>
                        {officers.map((officer) => (
                          <option key={officer._id} value={officer._id}>
                            {officer.firstName} {officer.lastName} (
                            {officer.department?.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="modal-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleVerifyIssue(selectedIssue._id, issueStatus)}
                      >
                        ✓ Verify Issue
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleAssignIssue(selectedIssue._id)}
                      >
                         Assign Issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowUserModal(true)}
              >
                ➕ Create New User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="no-data">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          {u.firstName} {u.lastName}
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          <span className={`badge badge-${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.department?.name || '-'}</td>
                        <td>
                          <span
                            className={`status ${u.isActive ? 'active' : 'inactive'}`}
                          >
                            {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeactivateUser(u._id)}
                            disabled={!u.isActive}
                          >
                            {u.isActive ? 'Deactivate' : 'Inactive'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Create User Modal */}
            {showUserModal && (
              <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="close-btn"
                    onClick={() => setShowUserModal(false)}
                  >
                    ✕
                  </button>

                  <h3>Create New User</h3>

                  <div className="form-group">
                    <label>First Name:</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstName: e.target.value })
                      }
                      placeholder="First name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name:</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastName: e.target.value })
                      }
                      placeholder="Last name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Email address"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone:</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role:</label>
                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value as any })
                      }
                    >
                      <option value="citizen">Citizen</option>
                      <option value="officer">Field Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {newUser.role === 'officer' && (
                    <div className="form-group">
                      <label>Department:</label>
                      <select
                        value={newUser.department}
                        onChange={(e) =>
                          setNewUser({ ...newUser, department: e.target.value })
                        }
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleCreateUser}
                    disabled={loading}
                  >
                    {loading ? '⏳ Creating...' : '✓ Create User'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>System Analytics & Performance</h2>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Issue Resolution Rate</h4>
                <div className="metric-display">
                  <div className="large-number">{stats.completionRate}%</div>
                  <p>Issues successfully resolved</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Average Resolution Time</h4>
                <div className="metric-display">
                  <div className="large-number">{stats.avgResolutionTime}</div>
                  <p>Days to resolve an issue</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>System Load</h4>
                <div className="metric-display">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(stats.totalIssues / Math.max(stats.totalIssues, 100)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p>{stats.totalIssues} issues in system</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>User Growth</h4>
                <div className="metric-display">
                  <div className="large-number">{stats.totalUsers}</div>
                  <p>Active system users</p>
                </div>
              </div>
            </div>

            <div className="analytics-table">
              <h3>Issue Breakdown by Status</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pending</td>
                    <td>{stats.pendingIssues}</td>
                    <td>
                      {Math.round((stats.pendingIssues / Math.max(stats.totalIssues, 1)) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td>Resolved</td>
                    <td>{stats.resolvedIssues}</td>
                    <td>
                      {Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td>In Progress</td>
                    <td>
                      {stats.totalIssues - stats.pendingIssues - stats.resolvedIssues}
                    </td>
                    <td>
                      {Math.round(
                        ((stats.totalIssues - stats.pendingIssues - stats.resolvedIssues) /
                          Math.max(stats.totalIssues, 1)) *
                          100
                      )}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>System Settings & Configuration</h2>

            <div className="settings-group">
              <h3>Departments Management</h3>
              <p>Manage county departments and their assignments.</p>
              <button className="btn btn-secondary">Manage Departments</button>
            </div>

            <div className="settings-group">
              <h3>Issue Categories</h3>
              <p>Configure issue categories and routing rules.</p>
              <button className="btn btn-secondary">Manage Categories</button>
            </div>

            <div className="settings-group">
              <h3>System Configuration</h3>
              <p>Configure SLAs, notifications, and email settings.</p>
              <button className="btn btn-secondary">System Settings</button>
            </div>

            <div className="settings-group">
              <h3>Reports & Export</h3>
              <p>Generate and export system reports.</p>
              <div className="button-group">
                <button
                  className="btn btn-info"
                  onClick={() => handleExportReport('csv')}
                >
                   Export CSV
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => handleExportReport('pdf')}
                >
                   Export PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Field Officers Management Tab */}
        {activeTab === 'officers' && (
          <div className="officers-management-section">
            <div className="section-header">
              <h2> Field Officer Management</h2>
              <p>Create field officers and manage their announcement permissions</p>
            </div>

            <div className="officers-header">
              <div className="officer-stat">
                <span className="stat-number">{officers.length}</span>
                <span className="stat-label">Total Officers</span>
              </div>
              <div className="officer-stat">
                <span className="stat-number">{officers.filter(o => o.canCreateAnnouncement === true).length}</span>
                <span className="stat-label">Announcement Enabled</span>
              </div>
              <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                ➕ Create New Officer
              </button>
            </div>

            <div className="officers-content">
              <div className="officers-filter">
                <input
                  type="text"
                  placeholder="Search officers..."
                  className="search-input"
                />
              </div>

              {officers.length === 0 ? (
                <div className="empty-state">
                  <p>No field officers created yet</p>
                  <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                    Create First Officer
                  </button>
                </div>
              ) : (
                <div className="officers-grid">
                  {officers.map(officer => (
                    <div key={officer._id} className="officer-card">
                      <div className="officer-avatar">
                        {officer.firstName.charAt(0)}{officer.lastName.charAt(0)}
                      </div>
                      <div className="officer-info">
                        <h3>{officer.firstName} {officer.lastName}</h3>
                        <p className="department">{officer.department?.name || 'No Department'}</p>
                        <p className="email">{officer.email}</p>
                      </div>
                      <div className="officer-permission">
                        <span className={`permission-badge ${(officer as any).canCreateAnnouncement ? 'enabled' : 'disabled'}`}>
                          {(officer as any).canCreateAnnouncement ? '✓ Announcement' : '✕ No Announcement'}
                        </span>
                      </div>
                      <button
                        className="btn btn-small btn-info"
                        onClick={() => {
                          setSelectedIssue(officer as any);
                          // Could open a modal here for more options
                        }}
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
