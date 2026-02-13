export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  priceInPKR?: number;
  quantity: number;
  category: 'Biryani Masala' | 'Karahai Gosht Masala' | 'Home Masala' | 'Other';
  image?: string;
  barcode?: string;
  qrCodeData?: string;
  qrCodePayload?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStat {
  _id: string;
  count: number;
  totalQuantity: number;
}

export interface CashDrawItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CashDraw {
  _id?: string;
  date: string;
  items: CashDrawItem[];
  totalAmount: number;
  totalItems: number;
}

export interface SaleTransaction {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  _id?: string;
  period: string;
  date: string;
  revenue: number;
  items: number;
  transactions: SaleTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesStats {
  totalRevenue: number;
  totalItems: number;
  totalTransactions: number;
  avgRevenue: number;
}

export interface BestSeller {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface GeneratedCode {
  _id: string;
  type: 'barcode' | 'qr';
  codeValue: string;
  name?: string;
  price: number;
  quantity: number;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}
