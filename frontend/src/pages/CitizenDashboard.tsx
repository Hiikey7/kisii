import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Issue } from '../types';
import '../styles/dashboard.css';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.getMyIssues({ limit: 10 });
      setIssues(response.data.issues);

      // Calculate stats
      const pending = response.data.issues.filter(
        (i: Issue) => i.status !== 'resolved'
      ).length;
      const resolved = response.data.issues.filter(
        (i: Issue) => i.status === 'resolved'
      ).length;

      setStats({
        total: response.data.total,
        pending,
        resolved,
      });
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.firstName}!</h1>
          <p>Manage your reported issues and track their progress</p>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <i className="fas fa-list"></i>
            </div>
            <div className="stat-content">
              <h3>Total Reports</h3>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>Resolved</h3>
              <p className="stat-value">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="issues-section">
          <div className="section-header">
            <h2>Your Reports</h2>
            <a href="/report-issue" className="btn btn-primary">
              + New Report
            </a>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : issues.length > 0 ? (
            <div className="issues-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date Reported</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id}>
                      <td>
                        <strong>{issue.title}</strong>
                      </td>
                      <td>{issue.category}</td>
                      <td>
                        <span className={`status-badge ${issue.status}`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a href={`/issues/${issue._id}`} className="btn-small">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted" style={{ padding: '40px' }}>
              No reports yet. <a href="/report-issue">Create your first report</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
