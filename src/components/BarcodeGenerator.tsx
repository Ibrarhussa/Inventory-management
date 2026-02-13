import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Download, Save, Scan, Trash2 } from 'lucide-react';
import { barcodeAPI, productAPI } from '../services/api';
import type { GeneratedCode, Product } from '../types';

interface BarcodeGeneratorProps {
  products: Product[];
}

interface SelectedProduct extends Product {
  selectedQuantity: number;
  adjustedPrice: number;
  barcodeCode?: string;
}

export function BarcodeGenerator({ products }: BarcodeGeneratorProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(products);
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<SelectedProduct | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<GeneratedCode | null>(null);
  const [scannedProductDetails, setScannedProductDetails] = useState<Product | null>(null);
  const [scannerCode, setScannerCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [savedBarcodes, setSavedBarcodes] = useState<GeneratedCode[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    setAvailableProducts(products);
  }, [products]);

  useEffect(() => {
    fetchSavedBarcodes();
  }, []);

  const fetchSavedBarcodes = async () => {
    try {
      setHistoryLoading(true);
      const response = await barcodeAPI.getAll();
      setSavedBarcodes(response.data);
    } catch (error) {
      console.error('Error fetching saved barcodes:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const addProduct = (productId: string) => {
    const product = availableProducts.find(p => p._id === productId);
    if (product && selectedProducts.length < 1000) {
      const selectedProduct: SelectedProduct = {
        ...product,
        selectedQuantity: 1,
        adjustedPrice: product.price
      };
      setSelectedProducts(prev => [...prev, selectedProduct]);
      setAvailableProducts(prev => prev.filter(p => p._id !== productId));
    }
  };

  const createNewProduct = () => {
    if (selectedProducts.length >= 1000) return;

    const newProduct: SelectedProduct = {
      _id: nextId.toString(),
      name: `Product ${nextId}`,
      description: '',
      price: 0,
      quantity: 0,
      category: 'Other',
      selectedQuantity: 1,
      adjustedPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setNextId(prev => prev + 1);
  };

  const removeProduct = (productId: string) => {
    const product = selectedProducts.find(p => p._id === productId);
    if (product) {
      setSelectedProducts(prev => prev.filter(p => p._id !== productId));
      setAvailableProducts(prev => [...prev, product]);
    }
  };

  const updateProduct = (productId: string, updates: Partial<SelectedProduct>) => {
    setSelectedProducts(prev => prev.map(p =>
      p._id === productId ? { ...p, ...updates } : p
    ));
  };

  const generateBarcode = async (product: SelectedProduct) => {
    setIsGenerating(true);
    const barcodeCode = `BC-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const productWithCode: SelectedProduct = { ...product, barcodeCode };
    setCurrentProduct(productWithCode);
    updateProduct(product._id, { barcodeCode });
    try {
      const qrCodeUrl = await QRCode.toDataURL(barcodeCode, { width: 200, margin: 2 });
      setCurrentBarcode(qrCodeUrl);

      const saved = await barcodeAPI.create({
        codeValue: barcodeCode,
        name: productWithCode.name,
        price: productWithCode.adjustedPrice,
        quantity: productWithCode.selectedQuantity,
        payload: {
          barcode: barcodeCode,
          id: productWithCode._id,
          description: productWithCode.description || '',
          name: productWithCode.name,
          price: productWithCode.adjustedPrice,
          quantity: productWithCode.selectedQuantity,
        },
      });

      setSavedBarcodes((prev) => [saved.data, ...prev]);
    } catch (error) {
      console.error('Error generating barcode:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const adjustPrice = (productId: string, delta: number) => {
    const product = selectedProducts.find(p => p._id === productId);
    if (product) {
      const newPrice = Math.max(0, product.adjustedPrice + delta);
      updateProduct(productId, { adjustedPrice: newPrice });
    }
  };

  const adjustQuantity = (productId: string, delta: number) => {
    const product = selectedProducts.find(p => p._id === productId);
    if (product) {
      const newQuantity = Math.max(1, product.selectedQuantity + delta);
      updateProduct(productId, { selectedQuantity: newQuantity });
    }
  };

  const saveAllChanges = async () => {
    try {
      for (const product of selectedProducts) {
        await productAPI.update(product._id, {
          price: product.adjustedPrice,
          quantity: product.quantity + product.selectedQuantity // Add to existing quantity
        });
      }
      alert('All products updated successfully!');
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Error saving products');
    }
  };

  const downloadBarcode = () => {
    if (!currentBarcode) return;

    const link = document.createElement('a');
    link.href = currentBarcode;
    link.download = `barcode-${currentProduct?.name || 'product'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scanBarcode = () => {
    setScannerOpen(true);
    setScannedProduct(null);
    setScannedProductDetails(null);
    setScannerCode('');
  };

  const findScannedBarcode = async () => {
    if (!scannerCode.trim()) return;
    try {
      setScanLoading(true);
      setScannedProduct(null);
      setScannedProductDetails(null);
      
      // First try to find product by barcode code in products list
      const foundProduct = products.find(p => p.barcode === scannerCode.trim());
      if (foundProduct) {
        setScannedProductDetails(foundProduct);
        // Create a scannedProduct from the found product
        setScannedProduct({
          _id: foundProduct._id,
          name: foundProduct.name || 'Unknown',
          codeValue: scannerCode.trim(),
          price: foundProduct.priceInPKR || foundProduct.price,
          quantity: foundProduct.quantity
        } as GeneratedCode);
        setScanLoading(false);
        return;
      }
      
      // Try to fetch all products and find by barcode
      try {
        const allProducts = await productAPI.getAll();
        const matchedProduct = allProducts.data.find((p: Product) => p.barcode === scannerCode.trim());
        if (matchedProduct) {
          setScannedProductDetails(matchedProduct);
          setScannedProduct({
            _id: matchedProduct._id,
            name: matchedProduct.name || 'Unknown',
            codeValue: scannerCode.trim(),
            price: matchedProduct.priceInPKR || matchedProduct.price,
            quantity: matchedProduct.quantity
          } as GeneratedCode);
          setScanLoading(false);
          return;
        }
      } catch (e) {
        console.log('Could not fetch product details from API');
      }
      
      // Finally try barcodeAPI lookup
      const response = await barcodeAPI.lookup(scannerCode.trim());
      setScannedProduct(response.data);
      
      // Try to get product details
      const productFromPayload = products.find(p => p.barcode === response.data.codeValue);
      if (productFromPayload) {
        setScannedProductDetails(productFromPayload);
      } else {
        try {
          const allProducts = await productAPI.getAll();
          const matchedProduct = allProducts.data.find((p: Product) => p.barcode === response.data.codeValue);
          if (matchedProduct) {
            setScannedProductDetails(matchedProduct);
          }
        } catch (e) {
          console.log('Could not fetch product details');
        }
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      alert('Barcode not found: ' + scannerCode);
      setScannedProduct(null);
      setScannedProductDetails(null);
    } finally {
      setScanLoading(false);
    }
  };

  const useSavedBarcode = async (record: GeneratedCode) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(record.codeValue, { width: 200, margin: 2 });
      setCurrentBarcode(qrCodeUrl);
      setCurrentProduct({
        _id: String(record.payload?.id ?? record._id),
        name: record.name || 'Saved Barcode',
        description: String(record.payload?.description ?? ''),
        price: record.price,
        quantity: 0,
        category: 'Other',
        selectedQuantity: record.quantity || 1,
        adjustedPrice: record.price || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error rendering saved barcode:', error);
    }
  };

  const deleteSavedBarcode = async (id: string) => {
    try {
      await barcodeAPI.delete(id);
      setSavedBarcodes((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Error deleting barcode:', error);
    }
  };

  return (
    <div className="space-y-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Barcode Generator & Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block">Add Products (Max 1000)</label>
            <div className="flex gap-2">
              <Select onValueChange={addProduct}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select existing products" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.slice(0, 100).map(product => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} - Rs. {product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={createNewProduct} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price (PKR)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map(product => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(product._id, { name: e.target.value })}
                          className="min-w-32 text-black bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product._id}
                          onChange={(e) => updateProduct(product._id, { _id: e.target.value })}
                          className="font-mono text-xs min-w-24 text-black bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustQuantity(product._id, -1)}
                            disabled={product.selectedQuantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={product.selectedQuantity}
                            onChange={(e) => updateProduct(product._id, { selectedQuantity: parseInt(e.target.value) || 1 })}
                            className="w-16 text-center text-black bg-white"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustQuantity(product._id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustPrice(product._id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={product.adjustedPrice}
                            onChange={(e) => updateProduct(product._id, { adjustedPrice: parseFloat(e.target.value) || 0 })}
                            className="w-20 text-center text-black bg-white"
                            min="0"
                            step="0.01"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustPrice(product._id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateBarcode(product)}
                          >
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(product._id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex gap-2">
                <Button onClick={saveAllChanges} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </Button>
                <Button variant="outline" onClick={scanBarcode}>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Barcode
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentBarcode && currentProduct && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="flex flex-col items-center gap-2">
              <img src={currentBarcode} alt="QR Code" className="w-48 h-48" />
                <div className="text-center">
                  <div className="font-semibold">{currentProduct.name}</div>
                  <div className="text-sm text-muted-foreground">Barcode: {currentProduct.barcodeCode || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">ID: {currentProduct._id.slice(-8)}</div>
                  <div className="text-sm text-muted-foreground">Price: Rs. {currentProduct.adjustedPrice}</div>
                  <div className="text-sm text-muted-foreground">Quantity: {currentProduct.selectedQuantity}</div>
              </div>
            </div>
            <Button variant="outline" onClick={downloadBarcode}>
              <Download className="w-4 h-4 mr-2" />
              Download Barcode
            </Button>
            {isGenerating && (
              <div className="text-sm text-muted-foreground">Generating barcode...</div>
            )}
          </CardContent>
        </Card>
      )}

      {scannerOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Barcode Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={scannerCode}
                onChange={(e) => setScannerCode(e.target.value)}
                placeholder="Paste/enter scanned barcode code"
                className="text-black bg-white"
              />
              <Button onClick={findScannedBarcode} disabled={scanLoading || !scannerCode.trim()}>
                {scanLoading ? 'Finding...' : 'Find'}
              </Button>
            </div>
            {scannedProduct ? (
              <div className="space-y-4">
                {/* Main Product Details Card */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{scannedProduct.name || 'Unknown Product'}</div>
                    <div className="text-lg text-muted-foreground">
                      <span className="font-semibold">Barcode:</span> {scannedProduct.codeValue}
                    </div>
                    <div className="text-3xl font-bold text-primary mt-3">
                      Rs. {(scannedProduct.price || 0).toFixed(2)}
                    </div>
                    <div className="text-lg text-muted-foreground mt-1">
                      Quantity: {scannedProduct.quantity || 0}
                    </div>
                  </div>
                </div>
                
                {/* Full Product Details */}
                {scannedProductDetails && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">📦</span> Product Full Details
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background/50 p-2 rounded">
                        <span className="text-muted-foreground">Name:</span>
                        <div className="font-medium">{scannedProductDetails.name}</div>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <span className="text-muted-foreground">Price:</span>
                        <div className="font-medium">Rs. {(scannedProductDetails.priceInPKR || scannedProductDetails.price).toFixed(2)}</div>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <span className="text-muted-foreground">Quantity:</span>
                        <div className="font-medium">{scannedProductDetails.quantity}</div>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium">{scannedProductDetails.category}</div>
                      </div>
                    </div>
                    {scannedProductDetails.description && (
                      <div className="mt-3 bg-background/50 p-2 rounded">
                        <span className="text-muted-foreground">Description:</span>
                        <div className="font-medium mt-1">{scannedProductDetails.description}</div>
                      </div>
                    )}
                  </div>
                )}
                
                <Button onClick={() => { setScannerOpen(false); setScannedProduct(null); setScannedProductDetails(null); }} className="w-full">
                  Close Scanner
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-muted-foreground mb-4">Enter scanned barcode code to get product details</div>
                <div className="w-32 h-32 bg-muted rounded mx-auto flex items-center justify-center">
                  <Scan className="w-8 h-8" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved Barcodes (Backend)</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-sm text-muted-foreground">Loading saved barcodes...</div>
          ) : savedBarcodes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No saved barcode yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedBarcodes.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.name || 'N/A'}</TableCell>
                    <TableCell>Rs. {record.price.toFixed(2)}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => useSavedBarcode(record)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteSavedBarcode(record._id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
