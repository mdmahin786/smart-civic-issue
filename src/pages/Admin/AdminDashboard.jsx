import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/issues/StatusBadge';
import { 
  BarChart3, Users, AlertCircle, CheckCircle, 
  Clock, Search, Filter, ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeatmapWidget from '../../components/admin/HeatmapWidget';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats(),
  });

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['admin-issues', activeTab, search],
    queryFn: () => adminAPI.getIssues({ 
      status: activeTab === 'all' ? undefined : activeTab,
      search 
    }),
  });

  const stats = statsData?.data || {
    total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0, geoData: []
  };
  const issues = issuesData?.data?.issues || [];

  return (
    <div className="admin-page container section-padding">
      <div className="admin-header">
        <h1>Admin Command Center</h1>
        <p>Overview of civic issues across Bangalore</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#EEF2FF', color: '#4F46E5'}}><BarChart3 size={24} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-name">Total Reports</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#FFFBEB', color: '#D97706'}}><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.pending}</span>
            <span className="stat-name">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#F5F3FF', color: '#7C3AED'}}><AlertCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.in_progress}</span>
            <span className="stat-name">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#ECFDF5', color: '#059669'}}><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-val">{stats.resolved}</span>
            <span className="stat-name">Resolved</span>
          </div>
        </div>
      </div>

      <HeatmapWidget geoData={stats.geoData || []} />

      <div className="admin-content card">
        <div className="table-controls">
          <div className="table-tabs">
            {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map(tab => (
              <button 
                key={tab} 
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="table-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Issue Details</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>Loading issues...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>No issues found matching criteria.</td></tr>
              ) : (
                issues.map(issue => (
                  <tr key={issue._id}>
                    <td>
                      <div className="table-issue-info">
                        <span className="issue-title">{issue.title}</span>
                        <span className="issue-area">{issue.area}</span>
                      </div>
                    </td>
                    <td><span className="category-tag">{issue.category.replace('_', ' ')}</span></td>
                    <td>{issue.reportedBy?.name || 'User'}</td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td>
                      <span className={`priority-dot ${issue.priority || 'medium'}`}></span>
                      {issue.priority || 'Medium'}
                    </td>
                    <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/issues/${issue._id}`} className="view-link">
                        View <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
