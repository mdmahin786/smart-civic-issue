import { useQuery } from '@tanstack/react-query';
import { issuesAPI } from '../../services/api';
import IssueCard from '../../components/issues/IssueCard';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyIssuesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-issues'],
    queryFn: () => issuesAPI.getMy(),
  });

  const issues = data?.data?.issues || [];

  return (
    <div className="container section-padding">
      <div className="section-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }}>My Reported Issues</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track the progress of issues you've reported.</p>
        </div>
        <Link to="/report" className="btn btn-primary">
          <PlusCircle size={20} /> Report New Issue
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>You haven't reported any issues yet</h3>
          <p>Be a proactive citizen and help improve our city.</p>
          <Link to="/report" className="btn btn-primary" style={{marginTop: '20px'}}>Report Your First Issue</Link>
        </div>
      ) : (
        <div className="issue-grid">
          {issues.map(issue => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssuesPage;
