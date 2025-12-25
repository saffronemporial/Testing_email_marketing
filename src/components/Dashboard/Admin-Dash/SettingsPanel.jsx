// src/components/System/SettingsPanel.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FaCog, FaSave, FaSync, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaSearch,
  FaFilter, FaEdit, FaTrash, FaPlus,
  FaDatabase, FaUserShield, FaBell,
  FaPalette, FaShieldAlt, FaKey
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const SettingsPanel = () => {
  const [settings, setSettings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingSetting, setEditingSetting] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    category: 'general',
    description: ''
  });

  const commonCategories = useMemo(() => [
    'general',
    'appearance', 
    'security',
    'notifications',
    'export',
    'import',
    'api',
    'system'
  ], []);

  useEffect(() => {
    checkAndCreateSettingsTable();
  }, []);

  const checkAndCreateSettingsTable = async () => {
    try {
      // First, check if settings table exists by trying to query it
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') { // Table doesn't exist
        toast.info('Settings table not found. Using local storage for settings.');
        await initializeDefaultSettings();
      } else {
        fetchSettings();
      }
    } catch (err) {
      console.error('Error checking settings table:', err);
      await initializeDefaultSettings();
    }
  };

  const initializeDefaultSettings = async () => {
    const defaultSettings = [
      { key: 'app_name', value: 'Saffron Emporial', category: 'general', description: 'Application name' },
      { key: 'theme', value: 'gold', category: 'appearance', description: 'Application theme' },
      { key: 'auto_logout', value: '30', category: 'security', description: 'Auto logout after inactivity (minutes)' },
      { key: 'export_format', value: 'csv', category: 'export', description: 'Default export format' },
      { key: 'max_file_size', value: '10', category: 'import', description: 'Maximum file size for imports (MB)' }
    ];

    // Store in local storage as fallback
    localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
    setSettings(defaultSettings);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category')
        .order('key');

      if (error) throw error;

      setSettings(data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(setting => setting.category))];
      setCategories(uniqueCategories);

    } catch (err) {
      console.error('Error fetching settings:', err);
      toast.error('Failed to load settings');
      // Fallback to local storage
      const localSettings = localStorage.getItem('app_settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingId, newValue) => {
    try {
      setSaving(true);

      // Check if using Supabase or local storage
      const { data: tableCheck } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

      if (tableCheck) {
        // Use Supabase
        const { error } = await supabase
          .from('settings')
          .update({
            value: newValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingId);

        if (error) throw error;
      } else {
        // Use local storage
        const currentSettings = JSON.parse(localStorage.getItem('app_settings') || '[]');
        const updatedSettings = currentSettings.map(setting => 
          setting.key === settingId ? { ...setting, value: newValue } : setting
        );
        localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
      }

      toast.success('Setting updated successfully');
      fetchSettings();

    } catch (err) {
      console.error('Error updating setting:', err);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const createSetting = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Check if using Supabase or local storage
      const { data: tableCheck } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

      if (tableCheck) {
        // Use Supabase
        const { error } = await supabase
          .from('settings')
          .insert([{
            key: newSetting.key,
            value: newSetting.value,
            category: newSetting.category,
            description: newSetting.description,
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      } else {
        // Use local storage
        const currentSettings = JSON.parse(localStorage.getItem('app_settings') || '[]');
        const newSettings = [...currentSettings, newSetting];
        localStorage.setItem('app_settings', JSON.stringify(newSettings));
        setSettings(newSettings);
      }

      toast.success('Setting created successfully');
      setShowAddModal(false);
      setNewSetting({
        key: '',
        value: '',
        category: 'general',
        description: ''
      });
      fetchSettings();

    } catch (err) {
      console.error('Error creating setting:', err);
      toast.error('Failed to create setting');
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (settingKey) => {
    try {
      // Check if using Supabase or local storage
      const { data: tableCheck } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

      if (tableCheck) {
        // Use Supabase
        const { error } = await supabase
          .from('settings')
          .delete()
          .eq('key', settingKey);

        if (error) throw error;
      } else {
        // Use local storage
        const currentSettings = JSON.parse(localStorage.getItem('app_settings') || '[]');
        const updatedSettings = currentSettings.filter(setting => setting.key !== settingKey);
        localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
      }

      toast.success('Setting deleted successfully');
      fetchSettings();

    } catch (err) {
      console.error('Error deleting setting:', err);
      toast.error('Failed to delete setting');
    }
  };

  const resetSettingsToDefault = async () => {
    if (!confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);

      const defaultSettings = [
        { key: 'app_name', value: 'Saffron Emporial', category: 'general', description: 'Application name' },
        { key: 'theme', value: 'gold', category: 'appearance', description: 'Application theme' },
        { key: 'auto_logout', value: '30', category: 'security', description: 'Auto logout after inactivity (minutes)' },
        { key: 'export_format', value: 'csv', category: 'export', description: 'Default export format' },
        { key: 'max_file_size', value: '10', category: 'import', description: 'Maximum file size for imports (MB)' }
      ];

      // Check if using Supabase or local storage
      const { data: tableCheck } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

      if (tableCheck) {
        // Delete existing settings and insert defaults in Supabase
        const { error: deleteError } = await supabase
          .from('settings')
          .delete()
          .neq('key', ''); // Delete all

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings);

        if (insertError) throw insertError;
      } else {
        // Use local storage
        localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
        setSettings(defaultSettings);
      }

      toast.success('Settings reset to default successfully');
      fetchSettings();

    } catch (err) {
      console.error('Error resetting settings:', err);
      toast.error('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const filteredSettings = useMemo(() => {
    return settings.filter(setting => {
      const matchesSearch = 
        setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.value.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [settings, searchTerm, filterCategory]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return <FaShieldAlt className="category-icon" />;
      case 'appearance': return <FaPalette className="category-icon" />;
      case 'notifications': return <FaBell className="category-icon" />;
      case 'export': return <FaDatabase className="category-icon" />;
      case 'import': return <FaDatabase className="category-icon" />;
      case 'api': return <FaKey className="category-icon" />;
      case 'system': return <FaCog className="category-icon" />;
      default: return <FaCog className="category-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="settings-panel glass-card">
        <div className="manager-header">
          <h3><FaCog /> System Settings</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaCog /> System Settings</h3>
          <p className="header-subtitle">Configure system behavior and preferences</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddModal(true)}
            className="primary-button"
          >
            <FaPlus /> Add Setting
          </button>
          <button 
            onClick={resetSettingsToDefault}
            className="secondary-button"
            disabled={saving}
          >
            <FaSync /> Reset to Default
          </button>
        </div>
      </div>

      {/* Settings Statistics */}
      <div className="settings-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCog />
          </div>
          <div className="stat-content">
            <h4>{settings.length}</h4>
            <p>Total Settings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserShield />
          </div>
          <div className="stat-content">
            <h4>{settings.filter(s => s.category === 'security').length}</h4>
            <p>Security Settings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaDatabase />
          </div>
          <div className="stat-content">
            <h4>{settings.filter(s => s.category === 'export' || s.category === 'import').length}</h4>
            <p>Data Settings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaPalette />
          </div>
          <div className="stat-content">
            <h4>{settings.filter(s => s.category === 'appearance').length}</h4>
            <p>Appearance Settings</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search settings by key, description, or value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {filteredSettings.map(setting => (
          <div key={setting.key} className="setting-card">
            <div className="setting-header">
              <div className="setting-category">
                {getCategoryIcon(setting.category)}
                <span className="category-name">{setting.category}</span>
              </div>
              <div className="setting-actions">
                <button 
                  className="btn-edit"
                  onClick={() => setEditingSetting(setting)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => deleteSetting(setting.key)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="setting-body">
              <h4 className="setting-key">{setting.key}</h4>
              <p className="setting-description">{setting.description}</p>
              <div className="setting-value">
                {editingSetting?.key === setting.key ? (
                  <div className="editing-controls">
                    <input
                      type="text"
                      value={editingSetting.value}
                      onChange={(e) => setEditingSetting({
                        ...editingSetting,
                        value: e.target.value
                      })}
                      className="value-input"
                    />
                    <div className="editing-actions">
                      <button 
                        className="btn-save"
                        onClick={async () => {
                          await updateSetting(setting.key, editingSetting.value);
                          setEditingSetting(null);
                        }}
                        disabled={saving}
                      >
                        <FaCheckCircle />
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => setEditingSetting(null)}
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="value-display">{setting.value}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Setting Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Setting</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createSetting}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Key *</label>
                  <input
                    type="text"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                    required
                    placeholder="e.g., app_name"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                    required
                  >
                    {commonCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="text"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                    required
                    placeholder="e.g., My Application"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                    rows="3"
                    placeholder="Describe what this setting controls..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Setting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;