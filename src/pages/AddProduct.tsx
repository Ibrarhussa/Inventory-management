import { useNavigate } from 'react-router-dom';
import { AddProductForm } from '../components/AddProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { productAPI } from '../services/api';

export function AddProduct() {
  const navigate = useNavigate();

  const handleAddProduct = async (formData: FormData) => {
    try {
      await productAPI.create(formData);
      alert('Product added successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

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
              <CardTitle className="text-xl sm:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Product</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Fill in the details to add a new product to your inventory</p>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <AddProductForm onSubmit={handleAddProduct} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}