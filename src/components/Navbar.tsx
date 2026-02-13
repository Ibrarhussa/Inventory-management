import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Add Product', path: '/add-product' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Barcode', path: '/barcode' },
  { name: 'Sales', path: '/sales' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-card via-card to-card/90 border-b border-border/50 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 shadow-md backdrop-blur-sm overflow-x-auto">
      <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 min-w-min">
        {/* Logo Section */}
        <div className="relative group flex-shrink-0">
          <div className="flex items-center justify-center w-16 h-8 sm:w-18 sm:h-9 lg:w-20 lg:h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg text-primary-foreground font-bold text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-gradient-flow cursor-pointer overflow-hidden animate-tilt-left-right origin-center">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-text-shimmer animate-text-glow">Alriwaj</span>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></div>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-1 sm:gap-1.5 lg:gap-2 flex-wrap justify-end">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md whitespace-nowrap',
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
