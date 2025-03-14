
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../theme/ThemeProvider';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40 w-full transition-all">
      <div className="container h-16 mx-auto px-4 sm:px-6 flex items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight">Mindful Journal</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="hidden md:flex">
            Sign In
          </Button>
          <Button size="sm" className="hidden md:flex">
            Get Started
          </Button>
          
          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
