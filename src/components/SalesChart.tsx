import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { salesAPI } from '../services/api';
import type { Sale } from '../types';

export function SalesChart() {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await salesAPI.getByPeriod('month');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback to empty array if no data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading sales data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center">
        <div className="text-muted-foreground">No sales data available yet</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="period" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Legend />
          <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="items" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}