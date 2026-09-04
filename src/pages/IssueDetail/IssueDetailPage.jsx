import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/issues/StatusBadge';
import StatusTimeline from '../../components/issues/StatusTimeline';
import { 
  MapPin, ThumbsUp, Calendar, User, 
  ArrowLeft, Share2, CheckCircle, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import './IssueDetailPage.css';

const IssueDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [statusNote, setStatusNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesAPI.getById(id),
  });

  const upvoteMutation = useMutation({
    mutationFn: () => issuesAPI.upvote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Upvoted successfully!');
    },
    onError: () => toast.error('Failed to upvote')
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus) => issuesAPI.updateStatus(id, { status: newStatus, note: statusNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Status updated!');
      setStatusNote('');
    },
    onError: () => toast.error('Failed to update status')
  });

  const issue = data?.data;
  const isUpvoted = issue?.upvotes?.includes(user?._id);
  const isAdmin = user?.role === 'admin';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) return <div className="container section-padding">Loading...</div>;
  if (isError) return <div className="container section-padding">Issue not found.</div>;

  return (
    <div className="issue-detail-page container section-padding">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to Issues
      </Link>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-header">
            <div className="title-section">
              <div className="category-meta">
                <span className="cat-icon">🕳️</span>
                <span>{issue.category.replace('_', ' ')}</span>
              </div>
              <h1>{issue.title}</h1>
            </div>
            <div className="header-actions">
              <StatusBadge status={issue.status} />
              <button className="btn-icon" title="Share" onClick={handleShare}>
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="gallery-section">
            <div className="main-image">
              <img src={issue.images[selectedImage]} alt={issue.title} />
            </div>
            {issue.images.length > 1 && (
              <div className="thumbnail-list">
                {issue.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="description-section card">
            <h3>Description</h3>
            <p>{issue.description}</p>
          </div>

          <div className="location-section card">
            <div className="section-title">
              <MapPin size={20} />
              <h3>Location Details</h3>
            </div>
            <div className="location-info">
              <p><strong>Address:</strong> {issue.address}</p>
              <p><strong>Area:</strong> {issue.area}</p>
              <p><strong>Pincode:</strong> {issue.pincode}</p>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${issue.address || ''}, ${issue.area || ''}, Bangalore, Karnataka ${issue.pincode || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mock-map-link"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="mock-map" style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px dashed var(--accent)' }}>
                <MapPin size={32} color="var(--accent)" />
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Click to View on Google Maps</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>📍 {issue.address}, {issue.area}</span>
              </div>
            </a>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="engagement-card card">
            <div className="upvote-section">
              <span className="upvote-count">{issue.upvotes?.length || 0}</span>
              <p>Citizens support this report</p>
              <button 
                className={`btn btn-block ${isUpvoted ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => upvoteMutation.mutate()}
                disabled={!user}
              >
                <ThumbsUp size={18} fill={isUpvoted ? 'white' : 'none'} />
                {isUpvoted ? 'Supported' : 'Support this Issue'}
              </button>
              {!user && <p className="auth-hint">Login to support</p>}
            </div>
          </div>

          <StatusTimeline history={issue.timeline} currentStatus={issue.status} />

          {isAdmin && (
            <div className="admin-actions card">
              <h3>Update Status (Admin)</h3>
              <div className="status-btns">
                <button 
                  className="btn btn-sm" 
                  style={{background: 'var(--status-assigned)', color: 'white'}}
                  onClick={() => statusMutation.mutate('assigned')}
                >
                  Assign
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{background: 'var(--status-in-progress)', color: 'white'}}
                  onClick={() => statusMutation.mutate('in_progress')}
                >
                  Work Started
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{background: 'var(--status-resolved)', color: 'white'}}
                  onClick={() => statusMutation.mutate('resolved')}
                >
                  Resolve
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{background: 'var(--status-rejected)', color: 'white'}}
                  onClick={() => statusMutation.mutate('rejected')}
                >
                  Reject
                </button>
              </div>
              <textarea 
                placeholder="Add a note for this update..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              ></textarea>
            </div>
          )}

          <div className="reporter-card card">
            <h3>Reporter Info</h3>
            <div className="info-item">
              <User size={16} />
              <span>{issue.reportedBy?.name || 'Anonymous'}</span>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <span>Reported on {new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
