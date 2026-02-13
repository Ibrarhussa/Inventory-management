import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-12 sm:h-14 lg:h-16 border-b border-border bg-gradient-to-r from-card via-card to-card/80 px-3 sm:px-4 lg:px-6 flex items-center justify-between backdrop-blur-sm bg-opacity-95 shadow-lg gap-2 animate-slide-in-down">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 lg:hidden hover:scale-110 duration-200">
          <Menu className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 hidden lg:flex hover:scale-110 duration-200">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xs sm:text-sm lg:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent truncate animate-gradient-flow\">Product Mgmt</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
        <div className="relative hidden md:block w-32 lg:w-64 transition-all duration-300 hover:scale-105">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 lg:w-4 h-3 lg:h-4 text-muted-foreground transition-colors duration-300" />
          <Input
            placeholder="Search..."
            className="pl-8 lg:pl-10 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all text-xs lg:text-sm py-1 lg:py-2 hover:border-primary/50 duration-300"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 hover:scale-110 hover:animate-bounce-slow duration-200">
          <Bell className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}