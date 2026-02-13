import axios from 'axios';
import type { Product, InventoryStat, CashDraw, Sale, SalesStats, BestSeller, GeneratedCode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

const toAbsoluteMediaUrl = (value?: string) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!API_ORIGIN) return value;
  return value.startsWith('/') ? `${API_ORIGIN}${value}` : `${API_ORIGIN}/${value}`;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: toAbsoluteMediaUrl(product.image),
});

const normalizeProductList = (products: Product[]): Product[] => products.map(normalizeProduct);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: async () => {
    const response = await api.get<Product[]>('/products');
    response.data = normalizeProductList(response.data);
    return response;
  },
  getById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    response.data = normalizeProduct(response.data);
    return response;
  },
  create: async (data: Partial<Product> | FormData) => {
    if (data instanceof FormData) {
      const response = await api.post<Product>('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      response.data = normalizeProduct(response.data);
      return response;
    }
    const response = await api.post<Product>('/products', data);
    response.data = normalizeProduct(response.data);
    return response;
  },
  update: async (id: string, data: Partial<Product> | FormData) => {
    if (data instanceof FormData) {
      const payload = new FormData();
      data.forEach((value, key) => payload.append(key, value));
      payload.append('_method', 'PUT');

      const response = await api.post<Product>(`/products/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      response.data = normalizeProduct(response.data);
      return response;
    }
    const response = await api.put<Product>(`/products/${id}`, data);
    response.data = normalizeProduct(response.data);
    return response;
  },
  delete: (id: string) => api.delete(`/products/${id}`),
  getStats: () => api.get<InventoryStat[]>('/products/stats/inventory'),
};

export const cashDrawAPI = {
  getByDate: (date?: string) => {
    const url = date ? `/cashdraw?date=${date}` : '/cashdraw';
    return api.get<CashDraw>(url);
  },
  getHistory: (startDate?: string, endDate?: string) => {
    let url = '/cashdraw/history';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get<CashDraw[]>(url);
  },
  addItem: (data: { date: string; productId: string; productName: string; quantity: number; price: number }) => {
    return api.post<CashDraw>('/cashdraw/add-item', data);
  },
  removeItem: (data: { date: string; productId: string }) => {
    return api.post<CashDraw>('/cashdraw/remove-item', data);
  },
  updateItem: (data: { date: string; productId: string; quantity: number; price: number }) => {
    return api.post<CashDraw>('/cashdraw/update-item', data);
  },
  clear: (date: string) => {
    return api.delete(`/cashdraw/clear?date=${date}`);
  },
};

export const salesAPI = {
  getSummary: (startDate?: string, endDate?: string) => {
    let url = '/sales/summary';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get<Sale[]>(url);
  },
  getByPeriod: (groupBy: 'day' | 'month' | 'year' = 'month') => {
    return api.get<Sale[]>(`/sales/by-period?groupBy=${groupBy}`);
  },
  syncFromCashDraw: (date: string) => {
    return api.post<Sale>('/sales/sync-from-cashdraw', { date });
  },
  getBestSellers: (limit: number = 10) => {
    return api.get<BestSeller[]>(`/sales/best-sellers?limit=${limit}`);
  },
  getStats: () => {
    return api.get<SalesStats>('/sales/stats');
  },
  create: (data: Partial<Sale>) => {
    return api.post<Sale>('/sales', data);
  },
  delete: (id: string) => {
    return api.delete(`/sales/${id}`);
  },
};

export const barcodeAPI = {
  getAll: () => api.get<GeneratedCode[]>('/barcodes'),
  lookup: (code: string) => api.get<GeneratedCode>(`/barcodes/lookup?code=${encodeURIComponent(code)}`),
  create: (data: {
    codeValue: string;
    name?: string;
    price?: number;
    quantity?: number;
    payload?: Record<string, unknown>;
  }) => api.post<GeneratedCode>('/barcodes', data),
  delete: (id: string) => api.delete(`/barcodes/${id}`),
};

export const qrCodeAPI = {
  getAll: () => api.get<GeneratedCode[]>('/qrcodes'),
  createBulk: (items: Array<{
    codeValue: string;
    name?: string;
    price?: number;
    quantity?: number;
    payload?: Record<string, unknown>;
  }>) => api.post<GeneratedCode[]>('/qrcodes/bulk', { items }),
  delete: (id: string) => api.delete(`/qrcodes/${id}`),
};

export default api;
