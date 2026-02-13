import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 400);

    setIsDark((prev) => !prev);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0 hover:scale-110 duration-200 relative"
    >
      <div className={`transition-all duration-400 ${isRotating ? 'rotate-360 scale-100' : 'rotate-0 scale-100'}`}>
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400 animate-spin-slow" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </div>
    </Button>
  );
}
