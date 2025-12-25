import { supabase } from '../supabaseClient';

export class AdvancedAnalyticsService {
  // Get executive summary KPIs
  static async getExecutiveSummary() {
    try {
      // Get current period data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: currentData, error: currentError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .neq('status', 'archived');

      if (currentError) throw currentError;

      // Get previous period data (30-60 days ago)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: previousData, error: previousError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
        .neq('status', 'archived');

      if (previousError) throw previousError;

      // Calculate metrics
      const currentRevenue = currentData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const previousRevenue = previousData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      // Get total customers
      const { count: totalCustomers, error: customerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      if (customerError) throw customerError;

      // Get inventory value - using available_quantity instead of stock_quantity
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('available_quantity, base_price');

      if (productsError) throw productsError;

      const inventoryValue = products.reduce((sum, product) => 
        sum + (product.available_quantity * product.base_price || 0), 0
      );

      return {
        totalRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalOrders: currentData.length,
        totalCustomers: totalCustomers || 0,
        inventoryValue: inventoryValue
      };
    } catch (error) {
      console.error('Error in getExecutiveSummary:', error);
      throw error;
    }
  }

  // Get revenue analytics data
  static async getRevenueAnalytics() {
    try {
      // Get last 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .neq('status', 'archived')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyRevenue = {};
      data.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
        monthlyRevenue[month] += order.total_amount || 0;
      });

      // Format for charts
      const monthlyRevenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      }));

      // Get revenue by category - simplified approach
      const { data: categoryData, error: categoryError } = await supabase
        .from('orders')
        .select('product_name, total_amount, status')
        .neq('status', 'archived');

      if (categoryError) throw categoryError;

      // Simple categorization based on product name
      const categoryMap = {};
      categoryData.forEach(order => {
        const name = order.product_name?.toLowerCase() || '';
        let category = 'Other';
        
        if (name.includes('premium')) category = 'Premium';
        else if (name.includes('organic')) category = 'Organic';
        else if (name.includes('standard')) category = 'Standard';
        
        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += order.total_amount || 0;
      });

      const revenueByCategory = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
      }));

      return {
        monthlyRevenue: monthlyRevenueData,
        revenueByCategory
      };
    } catch (error) {
  console.error('Error in getRevenueAnalytics:', error);
  // Return empty data instead of sample data
  return {
    monthlyRevenue: [],
    revenueByCategory: []
    };
  }
}
  // Get customer analytics data
  static async getCustomerAnalytics() {
    try {
      // Get customer distribution by business type
      const { data: customerTypeData, error: customerError } = await supabase
        .from('profiles')
        .select('business_type')
        .eq('role', 'client');

      if (customerError) throw customerError;

      // Group by business type
      const businessTypeCount = {};
      customerTypeData.forEach(profile => {
        const type = profile.business_type || 'Unknown';
        if (!businessTypeCount[type]) businessTypeCount[type] = 0;
        businessTypeCount[type]++;
      });

      const customerDistribution = Object.entries(businessTypeCount).map(([type, count]) => ({
        type,
        count
      }));

      // Get customer growth over time (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: growthData, error: growthError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (growthError) throw growthError;

      // Group by month
      const monthlyGrowth = {};
      growthData.forEach(profile => {
        const month = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyGrowth[month]) monthlyGrowth[month] = 0;
        monthlyGrowth[month]++;
      });

      const customerGrowth = Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        count
      }));

      return {
        customerDistribution,
        customerGrowth
      };
    } catch (error) {
      console.error('Error in getCustomerAnalytics:', error);
      // Return sample data for testing
      return {
        customerDistribution: [],
        customerGrowth: []
      };
    }
  }

  // Get inventory intelligence data - FIXED with correct column names
  static async getInventoryIntelligence() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, available_quantity, base_price')
        .order('available_quantity', { ascending: true });

      if (error) throw error;

      // Use a fixed threshold for low stock since we don't have min_stock_level
      const LOW_STOCK_THRESHOLD = 50;
      const lowStockItems = data.filter(product => 
        product.available_quantity <= LOW_STOCK_THRESHOLD
      );

      const totalInventoryValue = data.reduce((sum, product) => 
        sum + (product.available_quantity * product.base_price || 0), 0
      );

      return {
        lowStockAlerts: lowStockItems,
        totalInventoryValue,
        totalProducts: data.length
      };
    } catch (error) {
      console.error('Error in getInventoryIntelligence:', error);
      // Return sample data for testing
      return {
        lowStockAlerts: { lowStockAlerts: [], totalInventoryValue: 0, totalProducts: 0 } ,
      };
    }
  }

  // Get AI insights
  static async getAIAnalytics() {
    try {
      // For now, we'll generate simulated insights
      // In the future, you can connect to an AI API here
      
      return {
        trendingProducts: [
          { name: 'Premium Saffron', count: 45, revenue: 50000 },
          { name: 'Organic Saffron', count: 30, revenue: 35000 },
          { name: 'Standard Saffron', count: 25, revenue: 25000 }
        ],
        recommendations: [
          {
            type: 'inventory',
            message: 'Consider increasing stock of Premium Saffron based on recent demand',
            priority: 'high'
          },
          {
            type: 'pricing',
            message: 'Organic Saffron has higher profit margins - consider promoting it',
            priority: 'medium'
          },
          {
            type: 'customer',
            message: 'Wholesalers are your most valuable customer segment - focus retention efforts',
            priority: 'high'
          }
        ],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getAIAnalytics:', error);
      // Return mock data if there's an error
      return {
        trendingProducts: [
          { name: 'Premium Saffron', count: 45, revenue: 50000 },
          { name: 'Organic Saffron', count: 30, revenue: 35000 },
          { name: 'Standard Saffron', count: 25, revenue: 25000 }
        ],
        recommendations: [
          {
            type: 'inventory',
            message: 'Consider increasing stock of Premium Saffron based on recent demand',
            priority: 'high'
          },
          {
            type: 'pricing',
            message: 'Organic Saffron has higher profit margins - consider promoting it',
            priority: 'medium'
          },
          {
            type: 'customer',
            message: 'Wholesalers are your most valuable customer segment - focus retention efforts',
            priority: 'high'
          }
        ],
        lastUpdated: new Date().toISOString()
      };
    }
  }
}