import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Mail, Lock, Shield, Loader2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile | security
  
  const [profileData, setProfileData] = useState({ name: user?.name || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) return toast.error('Name is required');
    
    setProfileLoading(true);
    try {
      await updateProfile(profileData.name);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Settings size={22} color="#818cf8" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Account Settings</h2>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {/* Header/Banner */}
        <div style={{
          height: '120px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
          position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            position: 'absolute', bottom: '-40px', left: '2rem',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: '4px solid #16213e', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            {getInitials(user?.name)}
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '3rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>{user?.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Mail size={13} /> {user?.email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Shield size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Active Account</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1rem' }}>
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'security', label: 'Security & Password', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === id ? '#818cf8' : '#64748b',
              borderBottom: activeTab === id ? '2px solid #6366f1' : '2px solid transparent',
              fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
            }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text" value={profileData.name} onChange={(e) => setProfileData({ name: e.target.value })}
                    className="input-field" style={{ paddingLeft: '2.5rem' }} required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                  Email Address <span style={{ color: '#475569', fontSize: '0.75rem' }}>(Cannot be changed)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="email" value={user?.email || ''} disabled
                    className="input-field" style={{ paddingLeft: '2.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" disabled={profileLoading || profileData.name === user?.name}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {profileLoading && <Loader2 size={16} className="animate-spin" />}
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password" value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field" style={{ paddingLeft: '2.5rem' }} required placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password" value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field" style={{ paddingLeft: '2.5rem' }} required placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password" value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field" style={{ paddingLeft: '2.5rem' }} required placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
