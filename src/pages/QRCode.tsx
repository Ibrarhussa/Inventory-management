import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Play, Pause, RotateCcw, Trash2, QrCode } from 'lucide-react';
import { productAPI, qrCodeAPI } from '../services/api';
import type { GeneratedCode, Product } from '../types';

interface QRCodeItem {
  id: string;
  backendId?: string;
  name: string;
  price: number;
  quantity: number;
  codeValue?: string;
  qrDataUrl: string | null;
  isGenerating: boolean;
}

export function QRCodePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1);
  const [itemsPerLine, setItemsPerLine] = useState(3);
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsRes = await productAPI.getAll();
      setProducts(productsRes.data);
      await fetchSavedQRCodes();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedQRCodes = async () => {
    try {
      const response = await qrCodeAPI.getAll();
      await hydrateFromSavedRecords(response.data);
    } catch (error) {
      console.error('Error fetching saved QR codes:', error);
    }
  };

  const hydrateFromSavedRecords = async (records: GeneratedCode[]) => {
    const hydrated: QRCodeItem[] = [];
    for (const record of records) {
      try {
        const qrDataUrl = await generateSingleQR(record.codeValue);
        hydrated.push({
          id: `saved-${record._id}`,
          backendId: record._id,
          name: record.name || 'Saved QR',
          price: record.price || 0,
          quantity: record.quantity || 1,
          codeValue: record.codeValue,
          qrDataUrl,
          isGenerating: false,
        });
      } catch (error) {
        console.error('Error hydrating saved QR record:', error);
      }
    }
    setQrCodes(hydrated);
  };

  const generateSingleQR = async (text: string): Promise<string> => {
    return await QRCode.toDataURL(text, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  };

  const generateAllQRCodes = async () => {
    setIsGeneratingAll(true);
    setCurrentGeneratingIndex(-1);

    const qrItems: QRCodeItem[] = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      codeValue: '',
      qrDataUrl: null,
      isGenerating: true
    }));

    setQrCodes(qrItems);

    for (let i = 0; i < qrItems.length; i++) {
      setCurrentGeneratingIndex(i);
      const product = qrItems[i];
      const qrData = JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        priceCurrency: 'PKR',
        quantity: product.quantity
      });

      try {
        const qrDataUrl = await generateSingleQR(qrData);
        setQrCodes(prev => prev.map((item, idx) => 
          idx === i ? { ...item, codeValue: qrData, qrDataUrl, isGenerating: false } : item
        ));
      } catch (error) {
        console.error('Error generating QR:', error);
        setQrCodes(prev => prev.map((item, idx) => 
          idx === i ? { ...item, isGenerating: false } : item
        ));
      }
    }

    setIsGeneratingAll(false);
    setCurrentGeneratingIndex(-1);

    try {
      const payload = qrItems.map((item) => ({
        codeValue: item.codeValue || JSON.stringify({ id: item.id, name: item.name, price: item.price, priceCurrency: 'PKR', quantity: item.quantity }),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        payload: { id: item.id, priceCurrency: 'PKR' },
      }));
      await qrCodeAPI.createBulk(payload);
      await fetchSavedQRCodes();
    } catch (error) {
      console.error('Error saving generated QR codes:', error);
    }
  };

  const generateCustomQR = async () => {
    if (!customText.trim()) return;

    setIsGeneratingAll(true);
    setCurrentGeneratingIndex(-1);

    const lines = customText.split('\n').filter(line => line.trim());
    const qrItems: QRCodeItem[] = lines.map((line, index) => ({
      id: `custom-${index}`,
      name: line,
      price: 0,
      quantity: 1,
      codeValue: line,
      qrDataUrl: null,
      isGenerating: true
    }));

    setQrCodes(qrItems);

    for (let i = 0; i < qrItems.length; i++) {
      setCurrentGeneratingIndex(i);
      const product = qrItems[i];
      
      try {
        const qrDataUrl = await generateSingleQR(product.name);
        setQrCodes(prev => prev.map((item, idx) => 
          idx === i ? { ...item, codeValue: product.name, qrDataUrl, isGenerating: false } : item
        ));
      } catch (error) {
        console.error('Error generating QR:', error);
        setQrCodes(prev => prev.map((item, idx) => 
          idx === i ? { ...item, isGenerating: false } : item
        ));
      }
    }

    setIsGeneratingAll(false);
    setCurrentGeneratingIndex(-1);

    try {
      await qrCodeAPI.createBulk(
        qrItems.map((item) => ({
          codeValue: item.codeValue || item.name,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );
      await fetchSavedQRCodes();
    } catch (error) {
      console.error('Error saving custom QR codes:', error);
    }
  };

  const clearAll = () => {
    setQrCodes([]);
    setCustomText('');
    setUseCustomText(false);
  };

  const removeQRCode = (id: string) => {
    const current = qrCodes.find((item) => item.id === id);
    if (current?.backendId) {
      qrCodeAPI.delete(current.backendId).catch((error) => {
        console.error('Error deleting QR code:', error);
      });
    }
    setQrCodes(prev => prev.filter(item => item.id !== id));
  };

  const downloadAllQRCodes = async () => {
    for (const qrCode of qrCodes) {
      if (qrCode.qrDataUrl) {
        const link = document.createElement('a');
        link.href = qrCode.qrDataUrl;
        link.download = `qrcode-${qrCode.name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const printQRCodes = () => {
    window.print();
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
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">QR Code Generator</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Generate QR codes line by line</p>
          </div>

          {/* Mode Selection */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={!useCustomText ? "default" : "outline"}
                  onClick={() => setUseCustomText(false)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  From Products
                </Button>
                <Button 
                  variant={useCustomText ? "default" : "outline"}
                  onClick={() => setUseCustomText(true)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Custom Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Mode */}
          {!useCustomText && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Generate from Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={generateAllQRCodes} disabled={isGeneratingAll || products.length === 0}>
                    {isGeneratingAll ? (
                      <>
                        <Pause className="w-4 h-4 mr-2 animate-pulse" />
                        Generating... {currentGeneratingIndex >= 0 ? `(${currentGeneratingIndex + 1}/${qrCodes.length})` : ''}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate All QR Codes ({products.length})
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll} disabled={isGeneratingAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  {qrCodes.length > 0 && (
                    <>
                      <Button variant="outline" onClick={printQRCodes}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={downloadAllQRCodes}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  This will generate QR codes for all {products.length} products in the database.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Text Mode */}
          {useCustomText && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Custom Text Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Enter text (one line per QR code)
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter each value on a new line...&#10;Value 1&#10;Value 2&#10;Value 3"
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={generateCustomQR} disabled={isGeneratingAll || !customText.trim()}>
                    {isGeneratingAll ? (
                      <>
                        <Pause className="w-4 h-4 mr-2 animate-pulse" />
                        Generating... {currentGeneratingIndex >= 0 ? `(${currentGeneratingIndex + 1}/${qrCodes.length})` : ''}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate QR Codes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll} disabled={isGeneratingAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  {qrCodes.length > 0 && (
                    <>
                      <Button variant="outline" onClick={printQRCodes}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={downloadAllQRCodes}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Codes Display */}
          {qrCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Generated QR Codes ({qrCodes.length})</span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Items per line:</label>
                    <Input
                      type="number"
                      value={itemsPerLine}
                      onChange={(e) => setItemsPerLine(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                      className="w-16"
                      min="1"
                      max="6"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={printRef} className="space-y-4 print:space-y-4">
                  {/* Group QR codes by lines */}
                  {Array.from({ length: Math.ceil(qrCodes.length / itemsPerLine) }).map((_, lineIndex) => {
                    const startIdx = lineIndex * itemsPerLine;
                    const lineQRCodes = qrCodes.slice(startIdx, startIdx + itemsPerLine);
                    
                    return (
                      <div 
                        key={lineIndex}
                        className="flex flex-wrap gap-4 justify-center p-4 bg-muted/30 rounded-lg print:bg-transparent print:p-0"
                        style={{ pageBreakInside: 'avoid' }}
                      >
                        {lineQRCodes.map((qrCode) => (
                          <div
                            key={qrCode.id}
                            className="relative group flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border print:border print:shadow-none print:break-inside-avoid"
                          >
                            <button
                              onClick={() => removeQRCode(qrCode.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            
                            {qrCode.isGenerating ? (
                              <div className="w-32 h-32 flex items-center justify-center bg-muted rounded">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                              </div>
                            ) : qrCode.qrDataUrl ? (
                              <img 
                                src={qrCode.qrDataUrl} 
                                alt={`QR Code for ${qrCode.name}`}
                                className="w-32 h-32"
                              />
                            ) : (
                              <div className="w-32 h-32 flex items-center justify-center bg-muted rounded">
                                <span className="text-xs text-muted-foreground">Failed</span>
                              </div>
                            )}
                            
                            <div className="mt-2 text-center">
                              <div className="font-medium text-sm truncate max-w-[120px]">{qrCode.name}</div>
                              {qrCode.price > 0 && (
                                <div className="text-xs text-muted-foreground">Rs. {qrCode.price.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {qrCodes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="text-muted-foreground">
                  {useCustomText 
                    ? "Enter text above and click 'Generate QR Codes' to create QR codes"
                    : "Click 'Generate All QR Codes' to create QR codes for all products"
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
