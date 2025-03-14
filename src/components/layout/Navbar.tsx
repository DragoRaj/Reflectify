
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../theme/ThemeProvider';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, BookText, Flame, History, Settings, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40 w-full transition-all bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-950/80 dark:to-purple-950/80">
      <div className="container h-16 mx-auto px-4 sm:px-6 flex items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Mindful Journal</span>
        </Link>
        
        {user ? (
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <Button variant="ghost" className={location.pathname === '/dashboard' ? 'bg-accent' : ''}>
                      <Home className="h-4 w-4 mr-1.5" />
                      Home
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/journal">
                    <Button variant="ghost" className={location.pathname === '/journal' ? 'bg-accent' : ''}>
                      <BookText className="h-4 w-4 mr-1.5" />
                      Journal
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/rant-mode">
                    <Button variant="ghost" className={location.pathname === '/rant-mode' ? 'bg-accent' : ''}>
                      <Flame className="h-4 w-4 mr-1.5 text-red-500" />
                      Rant Mode
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/history">
                    <Button variant="ghost" className={location.pathname === '/history' ? 'bg-accent' : ''}>
                      <History className="h-4 w-4 mr-1.5" />
                      History
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/settings">
                    <Button variant="ghost" className={location.pathname === '/settings' ? 'bg-accent' : ''}>
                      <Settings className="h-4 w-4 mr-1.5" />
                      Settings
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ) : null}
        
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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  {user.email?.split('@')[0] || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden md:flex" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="hidden md:flex" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={20} />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden p-4 space-y-2 bg-background border-t border-border/40">
          <Link to="/dashboard" className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link to="/journal" className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <BookText className="h-4 w-4 mr-2" />
              Journal
            </Button>
          </Link>
          <Link to="/rant-mode" className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <Flame className="h-4 w-4 mr-2 text-red-500" />
              Rant Mode
            </Button>
          </Link>
          <Link to="/history" className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </Link>
          <Link to="/settings" className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
            Sign Out
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
