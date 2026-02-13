import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';
import { InventoryChart } from '../components/InventoryChart';
import { TrendChart } from '../components/TrendChart';
import { SalesChart } from '../components/SalesChart';
import { BarcodeGenerator } from '../components/BarcodeGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pin, Barcode, Package, TrendingUp, BarChart3, QrCode } from 'lucide-react';
import { productAPI } from '../services/api';
import type { Product, InventoryStat } from '../types';

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        productAPI.getAll(),
        productAPI.getStats(),
      ]);
      setProducts(productsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-background/80 dark:from-background dark:via-background/95 dark:to-primary/5">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-6 p-2 xs:p-3 sm:p-4 lg:p-6 h-full">
          <div className="flex-1 space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="flex justify-center py-2">
              <div className="relative group">
                <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-sm lg:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
                  <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
              </div>
            </div>
            <div className="animate-slide-in-down" style={{ animationDelay: '0ms' }}>
            <Card className="bg-gradient-to-r from-card via-card to-card/80 border-border/50 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-t-lg gap-2 sm:gap-0 relative z-10">
                <div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dashboard</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Welcome to your inventory management system</p>
                </div>
                <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg text-xs sm:text-sm hover:shadow-xl hover:shadow-primary/50 transition-all dark:hover:shadow-[#00ced1]/50 hover:shadow-[#00ffff]/50 hover:text-[#00ffff]">
                  <Link to="/add-product">
                    <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    Add New Product
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-3 xs:pt-4 sm:pt-6 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3 lg:gap-4">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-slide-in-left" style={{ animationDelay: '50ms' }}>
                    <p className="text-xs sm:text-sm text-muted-foreground font-semibold">Total Products</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mt-2">{products.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-3 sm:p-4 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
                    <p className="text-xs sm:text-sm text-muted-foreground font-semibold">Total Value</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mt-2">PKR{(products.reduce((sum, p) => sum + (p.price * p.quantity), 0)).toFixed(0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-3 sm:p-4 border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 animate-slide-in-left" style={{ animationDelay: '150ms' }}>
                    <p className="text-xs sm:text-sm text-muted-foreground font-semibold">Total Quantity</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mt-2">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-chart-2/20 to-chart-2/5 rounded-lg p-3 sm:p-4 border border-chart-2/20 hover:border-chart-2/40 transition-all duration-300 hover:shadow-lg hover:shadow-chart-2/20 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
                    <p className="text-xs sm:text-sm text-muted-foreground font-semibold">Categories</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-chart-2 mt-2">{stats.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <Button asChild className="h-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 text-primary border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 rounded-lg group dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff] hover:border-[#00ffff]" size="lg">
                <Link to="/products" className="flex flex-col items-center gap-2">
                  <Package className="w-6 sm:w-8 h-6 sm:h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">Products</span>
                </Link>
              </Button>
              
              <Button asChild className="h-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 rounded-lg group dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff] hover:border-[#00ffff]" size="lg">
                <Link to="/inventory" className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">Inventory</span>
                </Link>
              </Button>
              
              <Button asChild className="h-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent border border-accent/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 rounded-lg group dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff] hover:border-[#00ffff]" size="lg">
                <Link to="/barcode" className="flex flex-col items-center gap-2">
                  <QrCode className="w-6 sm:w-8 h-6 sm:h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">Barcodes</span>
                </Link>
              </Button>
              
              <Button asChild className="h-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-chart-2/20 to-chart-2/10 hover:from-chart-2/30 hover:to-chart-2/20 text-chart-2 border border-chart-2/30 hover:border-chart-2/50 transition-all duration-300 hover:shadow-lg hover:shadow-chart-2/20 rounded-lg group dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff] hover:border-[#00ffff]" size="lg">
                <Link to="/sales" className="flex flex-col items-center gap-2">
                  <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">Sales</span>
                </Link>
              </Button>
              
              <Button asChild className="h-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-chart-3/20 to-chart-3/10 hover:from-chart-3/30 hover:to-chart-3/20 text-chart-3 border border-chart-3/30 hover:border-chart-3/50 transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/20 rounded-lg group dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff] hover:border-[#00ffff]" size="lg">
                <Link to="/add-product" className="flex flex-col items-center gap-2">
                  <Plus className="w-6 sm:w-8 h-6 sm:h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">Add Product</span>
                </Link>
              </Button>
            </div>
            </div>

            <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 relative z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-secondary/20 rounded-lg">
                    <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-xs sm:text-sm lg:text-base">Recent Products</CardTitle>
                    <p className="text-xs text-muted-foreground">Latest items added</p>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-secondary/30">#</div>
              </CardHeader>
              <CardContent className="pt-2 xs:pt-3 sm:pt-4 lg:pt-6 overflow-x-auto relative z-10">
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </CardContent>
            </Card>
            </div>

            <div className="animate-slide-in-up" style={{ animationDelay: '150ms' }}>
            <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent relative z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-accent/20 rounded-lg">
                    <Barcode className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-xs sm:text-sm lg:text-base">Quick Barcodes</CardTitle>
                    <p className="text-xs text-muted-foreground">Top 6 products</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs hover:bg-accent/10 dark:hover:text-[#00ced1] hover:text-[#00ffff] hover:shadow-[#00ffff]/20">
                  <Link to="/barcode">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-2 xs:pt-3 sm:pt-4 lg:pt-6 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3">
                  {products.slice(0, 6).map((product, idx) => (
                    <div key={product._id} className="flex flex-col items-center gap-1.5 xs:gap-2 p-1.5 xs:p-2 sm:p-3 bg-background/50 rounded-lg border border-accent/20 hover:border-accent/40 hover:bg-background/70 transition-all duration-300 group animate-scale-in" style={{ animationDelay: `${250 + idx * 50}ms` }}>
                      <div className="w-14 sm:w-20 sm:h-20 h-14 bg-white rounded-lg p-1 border border-foreground/10 shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
                        <div className="w-full h-full rounded flex items-center justify-center font-mono text-xs sm:text-sm font-bold text-primary bg-gradient-to-br from-primary/10 to-secondary/10">
                          {product.name.substring(0, 3).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-foreground truncate w-full">{product.name.substring(0, 10)}</p>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 animate-fade-in" style={{ animationDelay: '350ms' }}>
              <div className="animate-scale-in" style={{ animationDelay: '250ms' }}>
              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/20 duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:blur-2xl transition-all duration-500"></div>
                <CardHeader className="flex flex-col gap-2 pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Inventory Tracking</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Product Quantity by Category</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-primary/20 rounded-lg">
                      <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <InventoryChart data={stats} />
                  <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2">
                    <div className="bg-primary/10 rounded-lg p-2 text-center hover:bg-primary/20 transition-colors duration-300">
                      <p className="text-xs text-muted-foreground">Low Stock</p>
                      <p className="text-lg font-bold text-primary">5</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-2 text-center hover:bg-accent/20 transition-colors duration-300">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-accent">{stats.length}</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-2 text-center hover:bg-secondary/20 transition-colors duration-300">
                      <p className="text-xs text-muted-foreground">Healthy</p>
                      <p className="text-lg font-bold text-secondary">{(stats.length - 5 >= 0 ? stats.length - 5 : 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>

              <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-secondary/30 transition-all hover:shadow-xl hover:shadow-secondary/20 duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:blur-2xl transition-all duration-500"></div>
                <CardHeader className="flex flex-col gap-2 pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-lg font-bold bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">Trend Analysis</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Quantity Trends Over Time</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-secondary/20 rounded-lg">
                      <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-secondary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <TrendChart />
                </CardContent>
              </Card>
              </div>

              <div className="animate-scale-in" style={{ animationDelay: '350ms' }}>
              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-accent/30 transition-all hover:shadow-xl hover:shadow-accent/20 duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:blur-2xl transition-all duration-500"></div>
                <CardHeader className="flex flex-col gap-2 pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-lg font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">Barcode Generation</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-1">Generate product barcodes</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-accent/20 rounded-lg">
                      <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <BarcodeGenerator products={products} />
                </CardContent>
              </Card>
              </div>

              <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
              <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-chart-2/30 transition-all hover:shadow-xl hover:shadow-chart-2/20 duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-chart-2/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:blur-2xl transition-all duration-500"></div>
                <CardHeader className="flex flex-col gap-2 pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-chart-2/10 via-chart-2/5 to-transparent relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-lg font-bold bg-gradient-to-r from-chart-2 to-chart-2/60 bg-clip-text text-transparent">Sales & Revenue</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-1">Revenue performance</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-chart-2/20 rounded-lg">
                      <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-chart-2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <SalesChart />
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-chart-1/10 rounded-lg p-2 text-center hover:bg-chart-1/20 transition-colors duration-300">
                      <p className="text-muted-foreground text-xs">Revenue</p>
                      <p className="text-sm font-bold text-chart-1 truncate">$55K</p>
                    </div>
                    <div className="bg-chart-2/10 rounded-lg p-2 text-center hover:bg-chart-2/20 transition-colors duration-300">
                      <p className="text-muted-foreground text-xs">Sold</p>
                      <p className="text-sm font-bold text-chart-2">225</p>
                    </div>
                    <div className="bg-chart-5/10 rounded-lg p-2 text-center hover:bg-chart-5/20 transition-colors duration-300">
                      <p className="text-muted-foreground text-xs">Top Item</p>
                      <p className="text-sm font-bold text-chart-5 truncate">Laptop</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}