import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import { User, Mail, Phone, Shield, Edit2, Save, X, Trophy, Award } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const { data: meRes } = useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.getMe(),
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => authAPI.getLeaderboard(),
  });

  const activeUser = meRes?.data || user;
  const leaderboard = leaderboardData?.data?.leaderboard || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) setIsEditing(false);
  };

  return (
    <div className="container section-padding">
      <div className="profile-container">
        <div className="profile-header card">
          <div className="profile-cover"></div>
          <div className="profile-avatar-row">
            <div className="profile-avatar large">
              {activeUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h1>{activeUser?.name}</h1>
              <div className="profile-badges-row">
                <span className="role-badge">{activeUser?.role}</span>
                <span className="reputation-badge">⭐ {activeUser?.reputationScore || 0} Rep</span>
              </div>
            </div>
            {!isEditing && (
              <button className="btn btn-outline edit-btn" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-content grid">
          <div className="profile-sidebar">
            {/* Badges Section */}
            <div className="info-card card" style={{ marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: '#F59E0B' }} /> My Badges
              </h3>
              <div className="badges-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {activeUser?.badges && activeUser.badges.length > 0 ? (
                  activeUser.badges.map((badge, i) => (
                    <span key={i} className={`badge-tag ${badge.toLowerCase().replace(' ', '-')}`}>
                      🏅 {badge}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>No badges earned yet. Resolve issues to earn points!</p>
                )}
              </div>
            </div>

            <div className="info-card card">
              <h3>Account Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <Mail size={18} />
                  <div>
                    <label>Email Address</label>
                    <p>{activeUser?.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <label>Phone Number</label>
                    <p>{activeUser?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Shield size={18} />
                  <div>
                    <label>User Role</label>
                    <p style={{textTransform: 'capitalize'}}>{activeUser?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main">
            {isEditing ? (
              <div className="edit-card card animate-fade-in">
                <h3>Edit Profile</h3>
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                      <X size={18} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="activity-card card" style={{ marginBottom: '20px' }}>
                  <h3>Recent Activity</h3>
                  <div className="empty-activity">
                    <p>Your recent reports and interactions will appear here.</p>
                  </div>
                </div>

                <div className="leaderboard-card card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} style={{ color: '#F59E0B' }} /> Bangalore Citizen Leaderboard
                  </h3>
                  <div className="leaderboard-list" style={{ marginTop: '12px' }}>
                    {leaderboard.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#888' }}>No leaderboard data available.</p>
                    ) : (
                      leaderboard.map((leader, i) => (
                        <div key={leader._id} className="leaderboard-item" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: leader._id === activeUser?._id ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                          border: leader._id === activeUser?._id ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid #f3f4f6',
                          marginBottom: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 'bold', width: '20px' }}>{i + 1}.</span>
                            <div className="leaderboard-avatar" style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              color: '#4f46e5',
                              fontSize: '0.85rem'
                            }}>
                              {leader.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: leader._id === activeUser?._id ? '600' : '400' }}>{leader.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {leader.badges && leader.badges.length > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                {leader.badges[leader.badges.length - 1]}
                              </span>
                            )}
                            <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{leader.reputationScore || 0} Rep</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
