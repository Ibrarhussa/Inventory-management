import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Package, Barcode, BarChart, QrCode, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: ShoppingBag, label: 'Products', path: '/products' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Barcode, label: 'Barcode', path: '/barcode' },
  { icon: QrCode, label: 'QR Code', path: '/qrcode' },
  { icon: DollarSign, label: 'Cash Draw', path: '/cashdraw' },
  { icon: BarChart, label: 'Sales', path: '/sales' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <div className="w-20 lg:w-24 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col items-center py-4 lg:py-8 gap-4 lg:gap-8 backdrop-blur-sm shadow-lg h-auto lg:min-h-screen animate-slide-in-left">
      <div className="relative group">
        <div className="flex items-center justify-center w-16 h-10 lg:w-20 lg:h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-xs lg:text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
          <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-lg animate-pulse-scale bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-lg"></div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 lg:gap-3">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                'p-2 md:p-3 rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-110',
                isActive
                  ? 'bg-gradient-to-br from-primary to-secondary text-sidebar-primary-foreground shadow-lg scale-105 animate-glow'
                  : 'text-sidebar-foreground/60 hover:text-primary hover:bg-sidebar-accent/60 hover:shadow-md'
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
              title={item.label}
            >
              <Icon className="w-4 md:w-5 h-4 md:h-5 transition-transform duration-300 group-hover:rotate-180" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
