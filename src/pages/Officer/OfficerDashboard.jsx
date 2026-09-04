import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, CheckCircle, UserCheck, Eye, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('unassigned');
  const [resolutionNotes, setResolutionNotes] = useState({});

  // Fetch all issues to filter locally for simpler offline state management
  const { data: issuesRes, isLoading } = useQuery({
    queryKey: ['officer-issues'],
    queryFn: () => issuesAPI.getAll({ limit: 100 }),
  });

  const issues = issuesRes?.data?.issues || [];

  // Filter issues based on officer's department and assignment status
  const unassignedTasks = issues.filter(iss => 
    iss.status === 'pending' && 
    (iss.department === user?.department || user?.department === 'other')
  );

  const myTasks = issues.filter(iss => 
    iss.assignedTo === user?._id || 
    (iss.assignedTo && iss.assignedTo._id === user?._id)
  );

  // Claim Mutation
  const claimMutation = useMutation({
    mutationFn: (id) => axios.patch(`http://localhost:5000/api/issues/${id}/claim`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('cw_token')}` }
    }),
    onSuccess: () => {
      toast.success('Task claimed successfully!');
      queryClient.invalidateQueries({ queryKey: ['officer-issues'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to claim task');
    }
  });

  // Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: ({ id, note }) => axios.patch(`http://localhost:5000/api/issues/${id}/official-resolve`, { resolutionNote: note }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('cw_token')}` }
    }),
    onSuccess: () => {
      toast.success('Task marked as resolved!');
      queryClient.invalidateQueries({ queryKey: ['officer-issues'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to resolve task');
    }
  });

  const handleResolveSubmit = (id) => {
    const note = resolutionNotes[id];
    if (!note || note.trim() === '') {
      toast.error('Please enter a resolution note before resolving');
      return;
    }
    resolveMutation.mutate({ id, note });
  };

  return (
    <div className="officer-dashboard container section-padding">
      <div className="dashboard-header card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h2>Officer Operations Center</h2>
        <p style={{ opacity: 0.9, marginTop: '4px' }}>
          Welcome back, <strong>{user?.name}</strong>. Managing department: <span style={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>{user?.department}</span>
        </p>
      </div>

      <div className="dashboard-tabs">
        <button 
          onClick={() => setActiveTab('unassigned')}
          className={`tab-btn ${activeTab === 'unassigned' ? 'active' : ''}`}
        >
          <ClipboardList size={18} /> Unassigned Ward Tasks ({unassignedTasks.length})
        </button>
        <button 
          onClick={() => setActiveTab('my-tasks')}
          className={`tab-btn ${activeTab === 'my-tasks' ? 'active' : ''}`}
        >
          <UserCheck size={18} /> My Active Assignments ({myTasks.filter(t => t.status !== 'resolved').length})
        </button>
      </div>

      <div className="tasks-container card" style={{ padding: '24px' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</p>
        ) : activeTab === 'unassigned' ? (
          unassignedTasks.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={40} style={{ color: '#10b981' }} />
              <p>Excellent! There are no unassigned reports in the {user?.department} queue.</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {unassignedTasks.map(task => (
                <div key={task._id} className="task-item">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span className={`priority-tag ${task.priority || 'medium'}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </div>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <span>📍 {task.location?.area || 'Bangalore'}</span>
                    <span>📅 {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="task-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <Link to={`/issues/${task._id}`} className="btn btn-outline" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Eye size={16} /> Details
                    </Link>
                    <button 
                      onClick={() => claimMutation.mutate(task._id)}
                      className="btn btn-primary"
                      disabled={claimMutation.isPending}
                    >
                      Claim Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          myTasks.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={40} style={{ color: '#6b7280' }} />
              <p>No active assignments. Browse unassigned tasks to claim work.</p>
            </div>
          ) : (
            <div className="my-tasks-list">
              {myTasks.map(task => (
                <div key={task._id} className="my-task-card" style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '16px',
                  background: task.status === 'resolved' ? '#f9fafb' : '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{task.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                        📍 {task.location?.address}, {task.location?.area} | Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{task.status}</span>
                      </p>
                    </div>
                    {task.status !== 'resolved' && (
                      <span className={`priority-tag ${task.priority || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '12px 0', fontSize: '0.9rem', color: '#374151' }}>
                    {task.description}
                  </p>

                  {task.status !== 'resolved' ? (
                    <div className="resolution-form" style={{ marginTop: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        Add Resolution Note
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Detail the work done to resolve this issue..."
                        value={resolutionNotes[task._id] || ''}
                        onChange={(e) => setResolutionNotes(prev => ({
                          ...prev,
                          [task._id]: e.target.value
                        }))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          fontSize: '0.875rem'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/issues/${task._id}`} className="btn btn-outline" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Eye size={16} /> View Info
                        </Link>
                        <button
                          onClick={() => handleResolveSubmit(task._id)}
                          className="btn btn-success"
                          style={{ background: '#10b981', color: 'white' }}
                          disabled={resolveMutation.isPending}
                        >
                          Resolve Issue
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '6px', marginTop: '12px', fontSize: '0.85rem', color: '#065f46' }}>
                      <strong>Resolution Note:</strong> {task.resolutionNote || 'Resolved by official'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
