import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './IssueCard.css';

const IssueCard = ({ issue }) => {
  const categoryIcons = {
    pothole: '🕳️',
    garbage: '🗑️',
    water_leakage: '💧',
    streetlight: '💡',
    sewage: '🚽',
    park: '🌳',
    other: '📌',
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <Link to={`/issues/${issue._id}`} className="issue-card animate-fade-in">
      <div className="card-image-wrapper">
        {issue.images && issue.images.length > 0 ? (
          <img src={issue.images[0]} alt={issue.title} className="card-image" />
        ) : (
          <div className="card-image-placeholder">
            <span className="placeholder-icon">{categoryIcons[issue.category] || '📌'}</span>
          </div>
        )}
        <div className="card-category-badge">
          {categoryIcons[issue.category]} {issue.category.replace('_', ' ')}
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-status-row">
          <StatusBadge status={issue.status} />
          <div className="card-upvotes">
            <ThumbsUp size={14} />
            <span>{issue.upvotes?.length || 0}</span>
          </div>
        </div>
        
        <h3 className="card-title">{issue.title}</h3>
        <p className="card-excerpt">{issue.description.substring(0, 100)}...</p>
        
        <div className="card-footer">
          <div className="card-info">
            <MapPin size={14} />
            <span>{issue.area}, {issue.pincode}</span>
          </div>
          <div className="card-info">
            <Clock size={14} />
            <span>{timeAgo(issue.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;
