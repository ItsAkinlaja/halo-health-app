const { supabase } = require('../utils/database');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class ProductService {
  async getProductByBarcode(barcode) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        throw new ValidationError(error.message);
      }

      return product;
    } catch (error) {
      logger.error('Error getting product by barcode:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async identifyProduct(parsedData) {
    try {
      // Try to match by name and brand
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (parsedData.productName) {
        query = query.ilike('name', `%${parsedData.productName}%`);
      }

      if (parsedData.brand) {
        query = query.ilike('brand', `%${parsedData.brand}%`);
      }

      const { data: products, error } = await query.limit(5);

      if (error) {
        throw new ValidationError(error.message);
      }

      // Return the best match (simplified logic)
      return products && products.length > 0 ? products[0] : null;
    } catch (error) {
      logger.error('Error identifying product:', error);
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      throw error;
    }
  }

  async updateProduct(productId, updateData) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  async searchProducts(query, limit = 20, offset = 0) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_active', true)
        .order('health_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      return products;
    } catch (error) {
      logger.error('Error searching products:', error);
      throw error;
    }
  }
}

module.exports = new ProductService();
