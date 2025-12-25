// src/services/analyticsService.js
import { supabase } from '../supabaseClient';
import { subMonths, format } from 'date-fns';

export async function fetchAdminAnalytics() {
  try {
    // 1. Get total users (from profiles table)
    const { count: totalUsers, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // 2. Get orders data with product information
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        total_amount, 
        created_at,
        product_id,
        products (name, category)
      `);

    if (ordersError) throw ordersError;

    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // 3. Get user growth data (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 5);
    const { data: userGrowthData, error: userGrowthError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    if (userGrowthError) throw userGrowthError;

    // Process user growth by month
    const userGrowthMap = {};
    const months = [];
    
    // Create month labels for the last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(new Date(), 5 - i);
      const monthKey = format(monthDate, 'MMM yyyy');
      months.push(monthKey);
      userGrowthMap[monthKey] = 0;
    }

    // Count users per month
    userGrowthData.forEach(user => {
      const userMonth = format(new Date(user.created_at), 'MMM yyyy');
      if (userGrowthMap[userMonth] !== undefined) {
        userGrowthMap[userMonth]++;
      }
    });

    const userGrowth = months.map(month => ({
      month,
      count: userGrowthMap[month]
    }));

    // 4. Get order status breakdown
    const statusCount = {};
    ordersData.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const orderStatus = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }));

    // 5. Calculate revenue by product category using orders data
    const revenueByCategory = {};
    
    ordersData.forEach(order => {
      const category = order.products?.category || 'Uncategorized';
      revenueByCategory[category] = (revenueByCategory[category] || 0) + (order.total_amount || 0);
    });

    const revenueByRegion = Object.entries(revenueByCategory)
      .map(([category, revenue]) => ({
        region: category,
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      userGrowth,
      orderStatus,
      revenueByRegion
    };

  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}