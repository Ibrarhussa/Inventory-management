import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Trash2, DollarSign, ShoppingCart, Calendar, Calculator } from 'lucide-react';
import { productAPI, cashDrawAPI } from '../services/api';
import type { Product, CashDraw } from '../types';

export function CashDraw() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cashDraw, setCashDraw] = useState<CashDraw | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customProductName, setCustomProductName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [useCustomProduct, setUseCustomProduct] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, cashDrawRes] = await Promise.all([
        productAPI.getAll(),
        cashDrawAPI.getByDate(selectedDate)
      ]);
      setProducts(productsRes.data);
      setCashDraw(cashDrawRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = async () => {
    try {
      if (useCustomProduct) {
        if (!customProductName || !customPrice) {
          alert('Please enter product name and price');
          return;
        }
        await cashDrawAPI.addItem({
          date: selectedDate,
          productId: `custom-${Date.now()}`,
          productName: customProductName,
          quantity: quantity,
          price: parseFloat(customPrice)
        });
        setCustomProductName('');
        setCustomPrice('');
      } else {
        if (!selectedProductId) {
          alert('Please select a product');
          return;
        }
        const product = products.find(p => p._id === selectedProductId);
        if (product) {
          await cashDrawAPI.addItem({
            date: selectedDate,
            productId: product._id,
            productName: product.name,
            quantity: quantity,
            price: product.price
          });
        }
      }
      setSelectedProductId('');
      setQuantity(1);
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const item = cashDraw?.items.find(i => i.productId === productId);
      if (item) {
        await cashDrawAPI.updateItem({
          date: selectedDate,
          productId,
          quantity: newQuantity,
          price: item.price
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cashDrawAPI.removeItem({
        date: selectedDate,
        productId
      });
      fetchData();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearAll = async () => {
    if (window.confirm('Are you sure you want to clear all items for this date?')) {
      try {
        await cashDrawAPI.clear(selectedDate);
        setCashDraw({ date: selectedDate, items: [], totalAmount: 0, totalItems: 0 });
      } catch (error) {
        console.error('Error clearing cash draw:', error);
      }
    }
  };

  const availableProducts = products.filter(
    p => !cashDraw?.items.some(item => item.productId === p._id)
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto">
        <div className="p-2 sm:p-4 lg:p-6">
          <div className="flex justify-center py-2">
            <div className="relative group">
              <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-sm lg:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
                <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Cash Draw</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track daily sales and calculate amounts</p>
          </div>

          {/* Date Selection */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Product Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!useCustomProduct ? "default" : "outline"}
                  onClick={() => setUseCustomProduct(false)}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  From Products
                </Button>
                <Button
                  variant={useCustomProduct ? "default" : "outline"}
                  onClick={() => setUseCustomProduct(true)}
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Custom Entry
                </Button>
              </div>

              {/* Product Selection */}
              {!useCustomProduct ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.length === 0 ? (
                          <SelectItem value="no-products" disabled>
                            All products added
                          </SelectItem>
                        ) : (
                          availableProducts.map(product => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button onClick={addItem} disabled={!selectedProductId}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                /* Custom Entry */
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Product Name"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-24"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button onClick={addItem} disabled={!customProductName || !customPrice}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Daily Sales Items
              </CardTitle>
              {cashDraw && cashDraw.items.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cashDraw && cashDraw.items.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashDraw.items.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <span className="font-medium">{item.productName}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-12 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ${item.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${item.total.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Items Sold</span>
                      <span className="font-medium">{cashDraw.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        ${cashDraw.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">
                    No items added for this date yet
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Select a product and add items to start tracking
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
