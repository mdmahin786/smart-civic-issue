const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'var(--status-pending)' },
    assigned: { label: 'Assigned', color: 'var(--status-assigned)' },
    in_progress: { label: 'In Progress', color: 'var(--status-in-progress)' },
    resolved: { label: 'Resolved', color: 'var(--status-resolved)' },
    rejected: { label: 'Rejected', color: 'var(--status-rejected)' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span 
      className="badge" 
      style={{ 
        backgroundColor: `${config.color}20`, 
        color: config.color,
        border: `1px solid ${config.color}40`
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
