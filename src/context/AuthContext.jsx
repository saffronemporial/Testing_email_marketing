import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          
          if (event === 'SIGNED_IN') {
            redirectBasedOnRole();
          }
        } else {
          setUser(null);
          setUserRole(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const redirectBasedOnRole = () => {
    if (!userRole) {
      navigate('/dashboard');
      return;
    }
    
    switch(userRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // SIMPLE CHECK FUNCTIONS - NO ADMIN APIS
  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.log('Email check error, proceeding anyway');
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkPhoneExists = async (phone) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.log('Phone check error, proceeding anyway');
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

const signUp = async (userData) => {
  try {
    console.log('Starting signup process...');

    // 1. Create auth user FIRST
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          company_name: userData.company_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
        }
      }
    });

    if (authError) throw authError;

    // 2. Wait for auth user to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      // Proceed anyway
    }

    if (existingProfile) {
      console.warn('Profile already exists. Skipping creation.');
      return authData;
    }

    // 4. Create profile only if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        phone: userData.phone,
        company_name: userData.company_name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        country: userData.country,
        state: userData.state,
        business_type: userData.business_type === 'Other' 
          ? userData.business_type_other 
          : userData.business_type,
        monthly_import_volume: userData.monthly_import_volume,
        additional_info: userData.additional_info,
        role: 'client'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile fails, try to continue anyway
    }

    return authData;

  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
};


  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
        redirectBasedOnRole();
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithOtp = async (phone) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return { message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
        redirectBasedOnRole();
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    userProfile,
    loading,
    signUp,
    signInWithEmail,
    signInWithOtp,
    verifyOtp,
    signOut,
    checkEmailExists,
    checkPhoneExists,
    isAdmin: userRole === 'admin',
    isClient: userRole === 'client',
    isStaff: userRole === 'staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};