import './StatusTimeline.css';
import { CheckCircle2, Clock, Hammer, UserCheck, XCircle } from 'lucide-react';

const StatusTimeline = ({ history = [], currentStatus }) => {
  const statusConfig = {
    pending: { label: 'Issue Reported', icon: <Clock size={16} />, color: 'var(--status-pending)' },
    assigned: { label: 'Officer Assigned', icon: <UserCheck size={16} />, color: 'var(--status-assigned)' },
    in_progress: { label: 'Work in Progress', icon: <Hammer size={16} />, color: 'var(--status-in-progress)' },
    resolved: { label: 'Issue Resolved', icon: <CheckCircle2 size={16} />, color: 'var(--status-resolved)' },
    rejected: { label: 'Report Rejected', icon: <XCircle size={16} />, color: 'var(--status-rejected)' },
  };

  // Mocking history if empty for demonstration
  const displayHistory = history.length > 0 ? history : [
    { status: 'pending', createdAt: new Date().toISOString(), note: 'Awaiting review' }
  ];

  return (
    <div className="timeline-container">
      <h3 className="timeline-title">Status Updates</h3>
      <div className="timeline">
        {displayHistory.map((item, index) => (
          <div key={index} className="timeline-item">
            <div 
              className="timeline-icon" 
              style={{ backgroundColor: statusConfig[item.status]?.color }}
            >
              {statusConfig[item.status]?.icon}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status-label">{statusConfig[item.status]?.label}</span>
                <span className="timeline-date">
                  {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {item.note && <p className="timeline-note">{item.note}</p>}
            </div>
            {index < displayHistory.length - 1 && <div className="timeline-line"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;
