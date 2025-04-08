
import { supabase } from "@/integrations/supabase/client";
import { Product, toast } from "./types";

export class ProductService {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      
      return data as Product[];
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        return undefined;
      }
      
      return data as Product;
    } catch (error) {
      console.error('Error in getProduct:', error);
      return undefined;
    }
  }

  // Add a new product
  async addProduct(productData: Omit<Product, "id">): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive",
        });
        return null;
      }
      
      return data as Product;
    } catch (error) {
      console.error('Error in addProduct:', error);
      return null;
    }
  }

  // Update product stock
  async updateProductStock(id: string, newStock: number): Promise<Product | undefined> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating product stock:', error);
        toast({
          title: "Error",
          description: "Failed to update product stock",
          variant: "destructive",
        });
        return undefined;
      }
      
      return data as Product;
    } catch (error) {
      console.error('Error in updateProductStock:', error);
      return undefined;
    }
  }
}
