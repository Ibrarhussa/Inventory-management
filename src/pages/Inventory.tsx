import { useState, useEffect, useRef } from 'react';
import { InventoryChart } from '../components/InventoryChart';
import { TrendChart } from '../components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin } from 'lucide-react';
import { productAPI } from '../services/api';
import type { InventoryStat } from '../types';

export function Inventory() {
  const [stats, setStats] = useState<InventoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrollValue, setScrollValue] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      const handleScroll = () => {
        const scrollTop = mainElement.scrollTop;
        const scrollHeight = mainElement.scrollHeight - mainElement.clientHeight;
        const value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollValue(value);
      };
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [loading]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setScrollValue(value);
    if (mainRef.current) {
      const scrollHeight = mainRef.current.scrollHeight - mainRef.current.clientHeight;
      mainRef.current.scrollTop = (value / 100) * scrollHeight;
    }
  };

  const fetchData = async () => {
    try {
      const statsRes = await productAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      <main ref={mainRef} className="flex-1 overflow-auto">
        <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="flex justify-center py-2">
            <div className="relative group">
              <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-sm lg:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
                <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Inventory Management</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track and monitor your product quantities</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-primary/30 transition-all">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg lg:text-lg font-bold">Inventory Tracking</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Product Quantity by Category</p>
                </div>
                <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4 lg:pt-6">
                <InventoryChart data={stats} />
                <div className="mt-3 sm:mt-4 lg:mt-4 text-xs sm:text-sm text-muted-foreground p-2 sm:p-3 lg:p-3 rounded-lg bg-accent/10">
                  Low Stock Alerts: <span className="text-accent font-bold">5 Items</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 hover:border-secondary/30 transition-all">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 lg:pb-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg lg:text-lg font-bold">Trend Analysis</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Product Quantity Trends</p>
                </div>
                <Pin className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0" />
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4 lg:pt-6">
                <TrendChart />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <input
        type="range"
        min="0"
        max="100"
        value={scrollValue}
        onChange={handleSliderChange}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 h-32 w-2 bg-primary/20 rounded-full appearance-none cursor-pointer"
        style={{ writingMode: 'vertical-rl' }}
      />
    </div>
  );
}