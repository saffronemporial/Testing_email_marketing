// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Business Settings
    businessName: 'Saffron Emporial',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    shipmentUpdates: true,
    
    // System Settings
    autoRefresh: true,
    refreshInterval: 30000,
    dataRetention: 365,
    backupFrequency: 'daily',
    
    // Export Settings
    defaultCarrier: 'dhl',
    exportDocumentation: true,
    customsClearance: true,
    
    // Theme Settings
    theme: 'gold',
    animations: true,
    glassEffect: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        // Save to database
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: updatedSettings,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    const defaultSettings = {
      businessName: 'Saffron Emporial',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
      lowStockAlerts: true,
      shipmentUpdates: true,
      autoRefresh: true,
      refreshInterval: 30000,
      dataRetention: 365,
      backupFrequency: 'daily',
      defaultCarrier: 'dhl',
      exportDocumentation: true,
      customsClearance: true,
      theme: 'gold',
      animations: true,
      glassEffect: true
    };

    await updateSettings(defaultSettings);
  };

  const value = {
    settings,
    updateSettings,
    resetSettings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;