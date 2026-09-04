import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { issuesAPI } from '../../services/api';
import IssueCard from '../../components/issues/IssueCard';
import { Search, Filter, AlertCircle } from 'lucide-react';
import './HomePage.css';

const categories = [
  { id: 'all', label: 'All Issues', icon: '📍' },
  { id: 'pothole', label: 'Potholes', icon: '🕳️' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'water_leakage', label: 'Water Leak', icon: '💧' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡' },
  { id: 'sewage', label: 'Sewage', icon: '🚽' },
  { id: 'park', label: 'Parks', icon: '🌳' },
  { id: 'other', label: 'Other', icon: '📌' },
];

const statuses = [
  { id: '', label: 'All Statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'rejected', label: 'Rejected' },
];

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['issues', activeCategory, activeStatus, search, page],
    queryFn: () => issuesAPI.getAll({
      category: activeCategory === 'all' ? undefined : activeCategory,
      status: activeStatus || undefined,
      search: search || undefined,
      page,
      limit: 9
    }),
  });

  const issues = data?.data?.issues || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="hero-badge">Smart Governance for Namma Bengaluru</span>
            <h1 className="hero-title">Report Civic Issues, <br/><span>Build a Better Bangalore.</span></h1>
            <p className="hero-subtitle">
              Voice your concerns about potholes, garbage, or streetlights. 
              Track resolutions in real-time and help our local authorities act faster.
            </p>
            <div className="hero-btns">
              <a href="/report" className="btn btn-accent">Report an Issue</a>
              <a href="#explore" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Explore Map</a>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="hero-stats-card">
              <div className="stat-item">
                <span className="stat-value">1.2k+</span>
                <span className="stat-label">Resolved</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">95%</span>
                <span className="stat-label">Response Rate</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Filters Section */}
      <section id="explore" className="container explore-section">
        <div className="section-header">
          <h2>Active Issues in Bangalore</h2>
          <div className="filters-bar">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search area or issue..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="status-filter">
              <Filter size={18} />
              <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="category-chips">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Issue Grid */}
        <div className="issue-grid">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton skeleton-img" style={{height: '200px'}}></div>
                <div className="skeleton-content" style={{padding: '20px'}}>
                  <div className="skeleton skeleton-title" style={{height: '20px', marginBottom: '10px'}}></div>
                  <div className="skeleton skeleton-text" style={{height: '40px', marginBottom: '10px'}}></div>
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="error-state">
              <AlertCircle size={48} color="var(--status-rejected)" />
              <h3>Failed to load issues</h3>
              <p>Please check your connection or try again later.</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏙️</div>
              <h3>No issues found</h3>
              <p>Try adjusting your filters or be the first to report an issue in this category.</p>
              <a href="/report" className="btn btn-primary">Report an Issue</a>
            </div>
          ) : (
            issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="btn-pagination"
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  className={`page-num ${page === num ? 'active' : ''}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="btn-pagination"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
