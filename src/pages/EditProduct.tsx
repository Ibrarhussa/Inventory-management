import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddProductForm } from '../components/AddProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { productAPI } from '../services/api';
import type { Product } from '../types';

export function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleUpdateProduct = async (formData: FormData) => {
    try {
      await productAPI.update(id!, formData);
      alert('Product updated successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Product not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto">
        <div className="p-2 sm:p-4 lg:p-6 max-w-2xl mx-auto w-full">
          <div className="flex justify-center py-2">
            <div className="relative group">
              <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-sm lg:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
                <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <Button variant="ghost" onClick={() => navigate('/products')} className="hover:bg-primary/10 hover:text-primary transition-all text-xs sm:text-sm">
              <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              Back to Products
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-primary/30 transition-all">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-t-lg">
              <CardTitle className="text-xl sm:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Edit Product</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Update product information</p>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <AddProductForm
                onSubmit={handleUpdateProduct}
                initialData={product}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
