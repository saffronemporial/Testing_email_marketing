// src/components/System/UserManagement.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FaUsers, FaUserPlus, FaEdit, FaTrash, FaSearch,
  FaFilter, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaLock, FaUnlock, FaDownload, FaUpload,
  FaShieldAlt, FaUserClock, FaUserCheck, FaUserTimes
} from 'react-icons/fa';
import { format, parseISO, differenceInDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    position: '',
    role_id: '',
    permissions: []
  });

  const permissionsList = useMemo(() => [
    'read:dashboard',
    'write:orders',
    'read:reports',
    'write:reports',
    'manage:users',
    'manage:settings',
    'export:data',
    'import:data',
    'approve:orders',
    'manage:inventory'
  ], []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);

      // Fetch users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          department,
          position,
          status,
          last_login,
          created_at,
          updated_at,
          user_roles (
            id,
            name,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch available roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      setUsers(usersData || []);
      setRoles(rolesData || []);

      await logSystemActivity('info', 'Users and roles loaded', 'UserManagement', {
        usersCount: usersData?.length || 0,
        rolesCount: rolesData?.length || 0
      });

    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load user data');
      await logSystemActivity('error', `User data fetch failed: ${err.message}`, 'UserManagement');
    } finally {
      setLoading(false);
    }
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      await supabase
        .from('system_logs')
        .insert([{
          level,
          message,
          component,
          metadata,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Logging error:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          position: formData.position
        }
      });

      if (authError) throw authError;

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          role_id: formData.role_id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      toast.success('User created successfully');
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        department: '',
        position: '',
        role_id: '',
        permissions: []
      });
      fetchUsersAndRoles();

      await logSystemActivity('info', 'New user created', 'UserManagement', {
        userId: authData.user.id,
        email: formData.email
      });

    } catch (err) {
      console.error('Error creating user:', err);
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          role_id: formData.role_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsersAndRoles();

      await logSystemActivity('info', 'User updated', 'UserManagement', {
        userId: selectedUser.id,
        updates: formData
      });

    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('users')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsersAndRoles();

      await logSystemActivity('info', 'User status changed', 'UserManagement', {
        userId: user.id,
        newStatus
      });

    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const resetUserPassword = async (user) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: 'TempPassword123!' }
      );

      if (error) throw error;

      toast.success('Password reset successfully. New password: TempPassword123!');
      
      await logSystemActivity('info', 'User password reset', 'UserManagement', {
        userId: user.id
      });

    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password');
    }
  };

  const generateUserReport = async () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('USER MANAGEMENT REPORT', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 105, 28, { align: 'center' });

      // User Statistics
      const stats = calculateUserStats();
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('User Statistics', 20, 50);

      const statsData = [
        ['Metric', 'Count'],
        ['Total Users', stats.total],
        ['Active Users', stats.active],
        ['Inactive Users', stats.inactive],
        ['Never Logged In', stats.neverLoggedIn],
        ['Average Days Since Last Login', stats.avgDaysSinceLogin.toFixed(1)]
      ];

      doc.autoTable({
        startY: 60,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [255, 215, 0] }
      });

      // Users List
      doc.text('User Details', 20, doc.lastAutoTable.finalY + 15);

      const userData = users.map(user => [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.user_roles?.name || 'No Role',
        user.department,
        user.status,
        format(new Date(user.created_at), 'dd/MM/yyyy'),
        user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy') : 'Never'
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Name', 'Email', 'Role', 'Department', 'Status', 'Created', 'Last Login']],
        body: userData,
        theme: 'grid',
        headStyles: { fillColor: [184, 134, 11] },
        styles: { fontSize: 8 }
      });

      // Save PDF
      doc.save(`user-management-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast.success('User report generated successfully');
      await logSystemActivity('info', 'User report generated', 'UserManagement');

    } catch (err) {
      console.error('Error generating user report:', err);
      toast.error('Failed to generate user report');
    }
  };

  const calculateUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const neverLoggedIn = users.filter(u => !u.last_login).length;
    
    const usersWithLogin = users.filter(u => u.last_login);
    const avgDaysSinceLogin = usersWithLogin.length > 0 
      ? usersWithLogin.reduce((sum, user) => sum + differenceInDays(new Date(), new Date(user.last_login)), 0) / usersWithLogin.length
      : 0;

    return { total, active, inactive, neverLoggedIn, avgDaysSinceLogin };
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.user_roles?.name === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const stats = calculateUserStats();

  if (loading) {
    return (
      <div className="user-management glass-card">
        <div className="manager-header">
          <h3><FaUsers /> User Management</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading user data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaUsers /> User Management</h3>
          <p className="header-subtitle">Manage system users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddModal(true)}
            className="primary-button"
          >
            <FaUserPlus /> Add User
          </button>
          <button 
            onClick={generateUserReport}
            className="secondary-button"
          >
            <FaDownload /> Generate Report
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h4>{stats.total}</h4>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <h4>{stats.active}</h4>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserTimes />
          </div>
          <div className="stat-content">
            <h4>{stats.inactive}</h4>
            <p>Inactive Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserClock />
          </div>
          <div className="stat-content">
            <h4>{stats.neverLoggedIn}</h4>
            <p>Never Logged In</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <strong>{user.first_name} {user.last_name}</strong>
                    <div className="user-email">
                      <FaEnvelope className="icon" /> {user.email}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    {user.phone && (
                      <div className="phone">
                        <FaPhone className="icon" /> {user.phone}
                      </div>
                    )}
                    <div className="position">{user.position}</div>
                  </div>
                </td>
                <td>
                  <span className="department-tag">{user.department}</span>
                </td>
                <td>
                  <span className="role-badge">
                    {user.user_roles?.name || 'No Role'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="login-info">
                    {user.last_login ? (
                      <>
                        {format(new Date(user.last_login), 'dd MMM yyyy')}
                        <div className="login-days">
                          {differenceInDays(new Date(), new Date(user.last_login))} days ago
                        </div>
                      </>
                    ) : (
                      <span className="never-logged">Never</span>
                    )}
                  </div>
                </td>
                <td>
                  {format(new Date(user.created_at), 'dd MMM yyyy')}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          first_name: user.first_name,
                          last_name: user.last_name,
                          phone: user.phone || '',
                          department: user.department,
                          position: user.position,
                          role_id: user.role_id,
                          email: user.email,
                          password: '',
                          permissions: []
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className={`btn-status ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleUserStatus(user)}
                    >
                      {user.status === 'active' ? <FaTimesCircle /> : <FaCheckCircle />}
                    </button>
                    <button 
                      className="btn-reset"
                      onClick={() => resetUserPassword(user)}
                    >
                      <FaLock />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
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
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User - {selectedUser.first_name} {selectedUser.last_name}</h3>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;