import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import type { Product } from '../types';

interface AddProductFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Product;
}

export function AddProductForm({ onSubmit, initialData }: AddProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.priceInPKR || initialData?.price || 0,
    quantity: initialData?.quantity || 0,
    category: initialData?.category || 'Other',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate unique barcode code
    const barcodeCode = `BC-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    
    // Price is already in PKR
    const priceInPKR = formData.price || 0;
    
    // Create QR code data with product details (price in PKR)
    const qrData = JSON.stringify({
      id: barcodeCode,
      name: formData.name,
      description: formData.description || '',
      price: priceInPKR,
      priceCurrency: 'PKR',
      quantity: formData.quantity,
      category: formData.category
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name || '');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('price', priceInPKR.toString());
    formDataToSend.append('priceInPKR', priceInPKR.toString());
    formDataToSend.append('quantity', formData.quantity?.toString() || '0');
    formDataToSend.append('category', formData.category || 'Other');
    formDataToSend.append('barcode', barcodeCode);
    formDataToSend.append('qrCodeData', qrCodeDataUrl);
    formDataToSend.append('qrCodePayload', qrData);

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    onSubmit(formDataToSend);

    // Only reset if not editing
    if (!initialData) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        category: 'Other',
      });
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Product Name</label>
        <Input
          placeholder="Enter product name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all text-xs sm:text-sm py-2 sm:py-3"
          required
        />
      </div>

      <div>
        <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Product Description</label>
        <Textarea
          placeholder="Enter product description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
          className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all text-xs sm:text-sm"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Price (PKR)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all text-xs sm:text-sm py-2 sm:py-3"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Quantity</label>
          <Input
            type="number"
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all text-xs sm:text-sm py-2 sm:py-3"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value as Product['category'] })}
        >
          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-all text-xs sm:text-sm py-2 sm:py-3">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Biryani Masala">Biryani Masala</SelectItem>
            <SelectItem value="Karahai Gosht Masala">Karahai Gosht Masala</SelectItem>
            <SelectItem value="Home Masala">Home Masala</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs sm:text-sm font-semibold text-black mb-2 block">Product Image</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        {!imagePreview ? (
          <div
            className="border-2 border-dashed border-primary/30 rounded-lg p-4 sm:p-6 flex items-center justify-center bg-primary/5 cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-2 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground">Click to upload image</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-24 sm:h-32 object-cover rounded-lg border border-primary/30 shadow-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 shadow-lg text-xs"
              onClick={removeImage}
            >
              <X className="w-3 sm:w-4 h-3 sm:h-4" />
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg text-xs sm:text-sm py-2 sm:py-3">
        Save Product
      </Button>
    </form>
  );
}
