// src/components/Auth/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import ProfilePictureUpload from './ProfilePictureUpload';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, loading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Avatar URL managed here; ProfilePictureUpload should call onChange(url)
  const [avatarUrl, setAvatarUrl] = useState('');

  // Personal info form
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    country: '',
    state: '',
    business_type: '',
    monthly_import_volume: '',
    additional_info: '',
  });

  // Security states
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityErr, setSecurityErr] = useState('');

  // Change password
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  // Two-factor (TOTP) MFA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [mfaFactors, setMfaFactors] = useState([]);
  const [enrollUri, setEnrollUri] = useState('');
  const [enrolledFactorId, setEnrolledFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // Login activity
  const [loginActivity, setLoginActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Initialize form data and avatar from userProfile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        company_name: userProfile.company_name || '',
        country: userProfile.country || '',
        state: userProfile.state || '',
        business_type: userProfile.business_type || '',
        monthly_import_volume: userProfile.monthly_import_volume || '',
        additional_info: userProfile.additional_info || '',
      });
      setAvatarUrl(userProfile.avatar_url || '');
    }
  }, [userProfile]);

  // Load MFA factors state
  useEffect(() => {
    const loadMfa = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        setMfaFactors(data?.factors || []);
        const hasTotp = (data?.factors || []).some(
          (f) => f.factor_type === 'totp' && f.status === 'verified'
        );
        setTwoFAEnabled(hasTotp);
      } catch (err) {
        // Non-fatal: MFA may not be enabled in project
        console.warn('MFA list error:', err.message);
      }
    };
    loadMfa();
  }, []);

  // Record a page view activity (real inserts into login_activity)
  useEffect(() => {
    const recordView = async () => {
      if (!user?.id) return;
      try {
        await supabase.from('login_activity').insert({
          user_id: user.id,
          event: 'profile_view',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      } catch (e) {
        // If table not yet created, ignore
        console.warn('Activity insert skipped:', e.message);
      }
    };
    recordView();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile details with Supabase client
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!user?.id) throw new Error('No authenticated user.');

      const updates = {
        ...formData,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      phone: userProfile?.phone || '',
      company_name: userProfile?.company_name || '',
      country: userProfile?.country || '',
      state: userProfile?.state || '',
      business_type: userProfile?.business_type || '',
      monthly_import_volume: userProfile?.monthly_import_volume || '',
      additional_info: userProfile?.additional_info || '',
    });
    setAvatarUrl(userProfile?.avatar_url || '');
    setEditing(false);
    setError('');
    setMessage('');
  };

  // Change password using supabase-js v2
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityMsg('');
    setSecurityErr('');
    try {
      if (!pwNew || pwNew.length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }
      if (pwNew !== pwConfirm) {
        throw new Error('New password and confirmation do not match.');
      }
      const { error: pwError } = await supabase.auth.updateUser({ password: pwNew });
      if (pwError) throw pwError;
      setSecurityMsg('Password updated successfully.');
      setPwNew('');
      setPwConfirm('');
      // Optional: force session refresh
      await supabase.auth.refreshSession();
    } catch (err) {
      setSecurityErr(err.message || 'Failed to update password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Enroll TOTP, provide URI for QR
  const handleEnroll2FA = async () => {
    setSecurityLoading(true);
    setSecurityMsg('');
    setSecurityErr('');
    setEnrollUri('');
    setEnrolledFactorId('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setEnrollUri(data?.totp?.uri || '');
      setEnrolledFactorId(data?.id || '');
    } catch (err) {
      setSecurityErr(err.message || 'Failed to enroll 2FA.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Verify TOTP to finalize enabling
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityMsg('');
    setSecurityErr('');
    try {
      if (!enrolledFactorId) throw new Error('No enrolled factor to verify.');
      if (!mfaCode || mfaCode.length < 6) throw new Error('Enter the 6-digit code from your authenticator app.');
      const { error } = await supabase.auth.mfa.verify({
        factorId: enrolledFactorId,
        code: mfaCode,
      });
      if (error) throw error;
      setSecurityMsg('Two-factor authentication enabled.');
      setTwoFAEnabled(true);
      setEnrollUri('');
      setMfaCode('');
      // Refresh factors
      const { data, error: listErr } = await supabase.auth.mfa.listFactors();
      if (!listErr) setMfaFactors(data?.factors || []);
    } catch (err) {
      setSecurityErr(err.message || 'Failed to verify 2FA.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Optional: Unenroll a verified TOTP factor
  const handleDisable2FA = async () => {
    setSecurityLoading(true);
    setSecurityMsg('');
    setSecurityErr('');
    try {
      const verifiedTotp = mfaFactors.find(
        (f) => f.factor_type === 'totp' && f.status === 'verified'
      );
      if (!verifiedTotp) throw new Error('No verified TOTP factor to disable.');
      const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedTotp.id });
      if (error) throw error;
      setSecurityMsg('Two-factor authentication disabled.');
      setTwoFAEnabled(false);
      const { data, error: listErr } = await supabase.auth.mfa.listFactors();
      if (!listErr) setMfaFactors(data?.factors || []);
    } catch (err) {
      setSecurityErr(err.message || 'Failed to disable 2FA.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Fetch recent login activity from our public login_activity table
  const fetchLoginActivity = async () => {
    setActivityLoading(true);
    setSecurityErr('');
    try {
      if (!user?.id) throw new Error('No authenticated user.');
      const { data, error: actErr } = await supabase
        .from('login_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (actErr) throw actErr;
      setLoginActivity(data || []);
    } catch (err) {
      setSecurityErr(err.message || 'Failed to load activity.');
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-section">
          <h2>Profile picture</h2>
          <ProfilePictureUpload
            value={avatarUrl}
            onChange={(url) => setAvatarUrl(url)}
            bucket="avatars"
            userId={user?.id}
          />
        </div>

        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Company name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>State/Region</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business type</label>
                <input
                  type="text"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Monthly import volume</label>
                <select
                  name="monthly_import_volume"
                  value={formData.monthly_import_volume}
                  onChange={handleInputChange}
                >
                  <option value="">Select Volume</option>
                  <option value="1-5 ton">1-5 ton</option>
                  <option value="5-20 ton">5-20 ton</option>
                  <option value="20-50 ton">20-50 ton</option>
                  <option value="50+ ton">50+ ton</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional information</label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us more about your business needs..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>
                    {userProfile?.first_name} {userProfile?.last_name}
                  </span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{userProfile?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Company:</label>
                  <span>{userProfile?.company_name || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Country:</label>
                  <span>{userProfile?.country || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>State/Region:</label>
                  <span>{userProfile?.state || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Business type:</label>
                  <span>{userProfile?.business_type || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Import volume:</label>
                  <span>{userProfile?.monthly_import_volume || 'Not specified'}</span>
                </div>
              </div>

              {userProfile?.additional_info && (
                <div className="info-item full-width">
                  <label>Additional information:</label>
                  <p>{userProfile.additional_info}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Information Section */}
        <div className="profile-section">
          <h2>Account information</h2>
          <div className="account-info">
            <div className="info-item">
              <label>User ID:</label>
              <span className="monospace">{user?.id}</span>
            </div>
            <div className="info-item">
              <label>Account role:</label>
              <span className="role-badge">{userProfile?.role || 'client'}</span>
            </div>
            <div className="info-item">
              <label>Member since:</label>
              <span>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <label>Last updated:</label>
              <span>
                {userProfile?.updated_at
                  ? new Date(userProfile.updated_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="profile-section">
          <h2>Security</h2>

          {/* Change Password */}
          <div className="security-block">
            <h3>Change password</h3>
            <form onSubmit={handleChangePassword} className="security-form">
              <div className="form-row">
                <div className="form-group">
                  <label>New password *</label>
                  <input
                    type="password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm new password *</label>
                  <input
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="btn btn-outline" disabled={securityLoading}>
                {securityLoading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="security-block">
            <h3>Two-factor authentication (TOTP)</h3>
            {!twoFAEnabled ? (
              <>
                <p className="muted">
                  Protect your account by enabling an authenticator app (Google Authenticator,
                  Authy, etc.).
                </p>
                <div className="twofa-actions">
                  <button
                    className="btn btn-outline"
                    onClick={handleEnroll2FA}
                    disabled={securityLoading}
                  >
                    {securityLoading ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
                {enrollUri && (
                  <div className="qr-container">
                    <label>Setup code (URI):</label>
                    <div className="monospace small">{enrollUri}</div>
                    <p className="muted small">
                      Copy into your authenticator app or render this as a QR using your preferred
                      QR component.
                    </p>
                    <form onSubmit={handleVerify2FA} className="security-form">
                      <div className="form-group">
                        <label>Enter 6-digit code</label>
                        <input
                          type="text"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="123456"
                        />
                      </div>
                      <button className="btn btn-outline" disabled={securityLoading}>
                        {securityLoading ? 'Verifying...' : 'Verify & enable'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="enabled-row">
                <span className="badge success">2FA enabled</span>
                <button
                  className="btn btn-outline"
                  onClick={handleDisable2FA}
                  disabled={securityLoading}
                >
                  Disable 2FA
                </button>
              </div>
            )}
          </div>

          {/* Login Activity */}
          <div className="security-block">
            <h3>Login activity</h3>
            <div className="activity-actions">
              <button className="btn btn-outline" onClick={fetchLoginActivity} disabled={activityLoading}>
                {activityLoading ? 'Loading...' : 'Refresh activity'}
              </button>
            </div>
            <div className="activity-list">
              {loginActivity.length === 0 ? (
                <p className="muted">No recent activity found. Click Refresh after creating the table.</p>
              ) : (
                loginActivity.map((evt) => (
                  <div className="activity-item" key={evt.id}>
                    <div className="activity-row">
                      <span className="monospace">
                        {new Date(evt.created_at).toLocaleString()}
                      </span>
                      <span>{evt.event}</span>
                      <span className="muted">{evt.ip || 'IP N/A'}</span>
                      <span className="muted">{evt.user_agent || ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {(securityMsg || securityErr) && (
              <div className={`message ${securityErr ? 'error' : 'success'}`}>
                {securityErr || securityMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
