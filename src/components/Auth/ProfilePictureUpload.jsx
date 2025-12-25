// src/components/Auth/ProfilePictureUpload.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = () => {
  const { user, userProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile]);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setError('');
      setMessage('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (JPEG, PNG, GIF, etc.)');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to the avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL with cache busting
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state with cache busting
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      setMessage('Profile picture updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setError(error.message);
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      setError('');
      setMessage('');

      const fileName = `${user.id}`;
      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (removeError) {
        throw removeError;
      }

      // Remove avatar URL from profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);
      setMessage('Profile picture removed successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setError(error.message);
      console.error('Error removing avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-picture-upload">
      <div className="avatar-container">
        <div className="avatar-preview">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="avatar-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="avatar-placeholder">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="avatar-controls">
          <div className="upload-controls">
            <label htmlFor="avatar-upload" className="btn btn-primary">
              {uploading ? 'Uploading...' : avatarUrl ? 'Change Picture' : 'Upload Picture'}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            
            {avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                className="btn btn-danger"
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>

          <div className="upload-info">
            <p>Supported formats: JPEG, PNG, GIF</p>
            <p>Max file size: 5MB</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="message success">
          {message}
        </div>
      )}

      {error && (
        <div className="message error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;