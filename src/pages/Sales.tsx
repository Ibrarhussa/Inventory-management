import { useState, useEffect } from 'react';
import { SalesChart } from '../components/SalesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, TrendingUp } from 'lucide-react';
import { salesAPI } from '../services/api';
import type { SalesStats, BestSeller } from '../types';

export function Sales() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bestSellersRes] = await Promise.all([
        salesAPI.getStats(),
        salesAPI.getBestSellers(3)
      ]);
      setStats(statsRes.data);
      setBestSellers(bestSellersRes.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await salesAPI.syncFromCashDraw(today);
      alert('Sales data synced successfully from cash draw!');
      fetchData();
    } catch (error) {
      console.error('Error syncing sales:', error);
      alert('Error syncing sales data');
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
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sales & Revenue</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Monitor your sales performance and revenue trends</p>
          </div>
          <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg lg:text-lg font-bold">Sales & Revenue Report</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Track your business performance</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSyncToday} variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sync Today
                </Button>
                <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 lg:pt-6">
              <SalesChart />
              <div className="mt-4 sm:mt-6 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-chart-1/10">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-chart-1 flex-shrink-0"></span>
                  <span className="text-muted-foreground">Total Revenue: <span className="text-foreground font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span></span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-chart-2/10">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-chart-2 flex-shrink-0"></span>
                  <span className="text-muted-foreground">Items Sold: <span className="text-foreground font-bold">{stats?.totalItems || 0}</span></span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-chart-5/10">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-chart-5 flex-shrink-0"></span>
                  <span className="text-muted-foreground">Best Seller: <span className="text-foreground font-bold">{bestSellers[0]?.productName || 'N/A'}</span></span>
                </div>
                {bestSellers.length > 1 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Top Sellers:</p>
                    {bestSellers.slice(0, 3).map((seller, idx) => (
                      <div key={seller.productId} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-xs">{idx + 1}. {seller.productName}</span>
                        <span className="text-xs font-bold text-primary">${seller.totalRevenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4 sm:mt-6 border-primary/30 hover:bg-primary/10 transition-all text-xs sm:text-sm">
                View Full Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}