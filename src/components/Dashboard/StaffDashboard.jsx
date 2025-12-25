// src/components/Dashboard/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, userProfile } = useAuth();
  const [staffStats, setStaffStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    pendingShipments: 0,
    attendance: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff-specific data
      const [
        tasksData,
        shipmentsData,
        attendanceData,
        recentTasksData,
        scheduleData
      ] = await Promise.all([
        supabase.from('tasks').select('id, status').eq('assigned_to', user.id),
        supabase.from('shipments').select('id, status').eq('assigned_staff', user.id),
        supabase.from('attendance').select('id, status').eq('staff_id', user.id).eq('date', new Date().toISOString().split('T')[0]),
        supabase.from('tasks').select('id, title, priority, due_date, status').eq('assigned_to', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('schedule').select('id, task, time, location').eq('staff_id', user.id).eq('date', new Date().toISOString().split('T')[0]).order('time', { ascending: true })
      ]);

      // Calculate stats
      const assignedTasks = tasksData.data?.length || 0;
      const completedTasks = tasksData.data?.filter(task => task.status === 'completed').length || 0;
      const pendingShipments = shipmentsData.data?.filter(shipment => shipment.status === 'pending').length || 0;
      const attendance = attendanceData.data?.length > 0 ? 100 : 0;

      setStaffStats({
        assignedTasks,
        completedTasks,
        pendingShipments,
        attendance
      });

      setRecentTasks(recentTasksData.data || []);
      setTodaySchedule(scheduleData.data || []);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert([
          {
            staff_id: user.id,
            date: new Date().toISOString().split('T')[0],
            status: 'present',
            check_in: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      // Refresh data
      fetchStaffData();
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <p>Welcome back, {userProfile?.first_name || user?.email}</p>
        
        {/* Attendance Marker */}
        <div className="attendance-marker">
          <p>Today's Attendance: {staffStats.attendance > 0 ? '✅ Present' : '❌ Not Marked'}</p>
          {staffStats.attendance === 0 && (
            <button onClick={markAttendance} className="btn btn-primary">
              Mark Attendance
            </button>
          )}
        </div>
      </div>

      {/* Staff Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 153, 51, 0.1)' }}>
            <span>📋</span>
          </div>
          <div className="stat-content">
            <h3>{staffStats.assignedTasks}</h3>
            <p>Assigned Tasks</p>
          </div>
          <div className="stat-badge warning">{staffStats.completedTasks} Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
            <span>🚚</span>
          </div>
          <div className="stat-content">
            <h3>{staffStats.pendingShipments}</h3>
            <p>Pending Shipments</p>
          </div>
          <Link to="/staff/tasks" className="stat-link">View Tasks</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 153, 51, 0.1)' }}>
            <span>✅</span>
          </div>
          <div className="stat-content">
            <h3>{staffStats.attendance}%</h3>
            <p>Attendance</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
            <span>⭐</span>
          </div>
          <div className="stat-content">
            <h3>4.8/5</h3>
            <p>Performance Rating</p>
          </div>
          <div className="stat-badge success">Excellent</div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="dashboard-section">
        <h2>Today's Schedule</h2>
        <div className="schedule-list">
          {todaySchedule.length > 0 ? (
            todaySchedule.map(item => (
              <div key={item.id} className="schedule-item">
                <div className="schedule-time">
                  {new Date(`2000-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="schedule-details">
                  <h4>{item.task}</h4>
                  <p>{item.location}</p>
                </div>
                <div className="schedule-status">
                  <span className="status-badge pending">Upcoming</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No scheduled tasks for today</p>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Tasks</h2>
          <Link to="/staff/tasks" className="btn btn-outline">View All Tasks</Link>
        </div>

        <div className="tasks-list">
          {recentTasks.length > 0 ? (
            recentTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
                <div className={`status-badge ${task.status}`}>
                  {task.status}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No tasks assigned</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/staff/task-assign" className="action-card">
            <div className="action-icon">📝</div>
            <h3>View Tasks</h3>
            <p>Check your assigned tasks</p>
          </Link>

          <Link to="/staff/attendance" className="action-card">
            <div className="action-icon">⏰</div>
            <h3>Attendance</h3>
            <p>View attendance records</p>
          </Link>

          <Link to="/staff/shipments" className="action-card">
            <div className="action-icon">🚚</div>
            <h3>Shipments</h3>
            <p>Manage shipments</p>
          </Link>

          <Link to="/staff/reports" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Daily Report</h3>
            <p>Submit daily work report</p>
          </Link>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="dashboard-section">
        <h2>Performance Metrics</h2>
        <div className="performance-metrics">
          <div className="metric-card">
            <h4>Task Completion Rate</h4>
            <div className="metric-value">92%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="metric-card">
            <h4>On-Time Delivery</h4>
            <div className="metric-value">88%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '88%' }}></div>
            </div>
          </div>
          <div className="metric-card">
            <h4>Quality Rating</h4>
            <div className="metric-value">4.7/5</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="dashboard-section">
        <h2>Notifications</h2>
        <div className="notifications-list">
          <div className="notification-item">
            <div className="notification-icon">📦</div>
            <div className="notification-content">
              <p>New shipment assigned to you for processing</p>
              <small>10 minutes ago</small>
            </div>
          </div>
          <div className="notification-item">
            <div className="notification-icon">📋</div>
            <div className="notification-content">
              <p>Quality check required for shipment #456789</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="notification-item">
            <div className="notification-icon">⭐</div>
            <div className="notification-content">
              <p>You received a 5-star rating from Client #123</p>
              <small>1 day ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;