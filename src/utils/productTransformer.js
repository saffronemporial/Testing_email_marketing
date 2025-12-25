/**
 * Transform Supabase product data to match component expectations
 */
export const transformProduct = (supabaseProduct) => {
  if (!supabaseProduct) return null;

  return {
    // Direct mappings
    id: supabaseProduct.id,
    name: supabaseProduct.name || 'Unnamed Product',
    description: supabaseProduct.description || 'No description available',
    category: supabaseProduct.category || 'Uncategorized',
    sku: supabaseProduct.sku || 'N/A',
    
    // Price mappings
    base_price: parseFloat(supabaseProduct.base_price) || 0,
    unit: supabaseProduct.unit || 'kg',
    
    // Quantity mappings
    min_order_quantity: parseFloat(supabaseProduct.min_order_quantity) || 1,
    max_order_quantity: parseFloat(supabaseProduct.max_order_quantity) || 1000,
    available_quantity: parseFloat(supabaseProduct.available_quantity) || 10000,
    
    // Boolean flags
    featured: supabaseProduct.featured || false,
    in_stock: supabaseProduct.is_active || false, // Map is_active to in_stock
    
    // Media URLs
    product_image: supabaseProduct.product_image || '',
    video_url: supabaseProduct.video_url || null,
    model_3d_url: supabaseProduct.model_3d_url || null,
    
    // Transform gallery_images (text[]) to images (array)
    images: supabaseProduct.gallery_images && supabaseProduct.gallery_images.length > 0
      ? supabaseProduct.gallery_images
      : (supabaseProduct.product_image ? [supabaseProduct.product_image] : []),
    
    // Build specifications from available fields
    specifications: {
      'HS Code': supabaseProduct.hs_code || 'N/A',
      'Shelf Life': supabaseProduct.shelf_life || 'N/A',
      'Storage': supabaseProduct.storage_requirements || 'N/A',
      'Packaging': supabaseProduct.packaging_options 
        ? (Array.isArray(supabaseProduct.packaging_options) 
            ? supabaseProduct.packaging_options.join(', ') 
            : supabaseProduct.packaging_options)
        : 'N/A',
      'Delivery Ports': supabaseProduct.delivery_ports
        ? (Array.isArray(supabaseProduct.delivery_ports)
            ? supabaseProduct.delivery_ports.join(', ')
            : supabaseProduct.delivery_ports)
        : 'N/A',
    },
    
    // Certifications
    certifications: supabaseProduct.certifications || [],
    
    // Quality standards as certifications
    quality_standards: supabaseProduct.quality_standards || [],
    
    // Create tier pricing from your data (you can customize this logic)
    tier_pricing: [
      { 
        min_quantity: parseFloat(supabaseProduct.min_order_quantity) || 1, 
        price: parseFloat(supabaseProduct.base_price) || 0 
      },
      { 
        min_quantity: 100, 
        price: parseFloat(supabaseProduct.base_price) * 0.95 || 0 
      },
      { 
        min_quantity: 500, 
        price: parseFloat(supabaseProduct.base_price) * 0.90 || 0 
      },
    ],
    
    // Origin mapping
    origin: supabaseProduct.origin_country || 'Unknown',
    
    // Lead time (you can calculate or set default)
    lead_time: '7-14 days', // Default value
    
    // Additional fields
    rating: parseFloat(supabaseProduct.rating) || 0,
    product_tags: supabaseProduct.product_tags || [],
    
    // Timestamps
    created_at: supabaseProduct.created_at,
    updated_at: supabaseProduct.updated_at,
  };
};

/**
 * Transform array of products
 */
export const transformProducts = (supabaseProducts) => {
  if (!Array.isArray(supabaseProducts)) return [];
  return supabaseProducts.map(transformProduct).filter(Boolean);
};