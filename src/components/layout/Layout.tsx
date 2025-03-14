
import React from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <motion.main 
          className="flex-1 container mx-auto py-6 px-4 sm:px-6 md:px-8 max-w-6xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
        <footer className="py-6 px-4 border-t border-border/40 mt-auto">
          <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Mindful Journal © {new Date().getFullYear()}
            </p>
            <p className="text-sm text-muted-foreground">
              Record your thoughts. Reflect with intention.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
