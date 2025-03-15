
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookText, Flame, RefreshCw } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-[80vh] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            delay: 0.2, 
            duration: 0.8 
          }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-6 px-4"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-balance">
            Reflectify
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-4 text-2xl md:text-3xl text-gray-600 dark:text-gray-300"
          >
            <motion.span whileHover={{ scale: 1.05 }} className="font-serif">Reflect.</motion.span>
            <motion.span whileHover={{ scale: 1.05 }} className="font-serif text-red-500 dark:text-red-400">Rant.</motion.span>
            <motion.span whileHover={{ scale: 1.05 }} className="font-serif text-green-500 dark:text-green-400">Reset.</motion.span>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4"
          >
            A mindful space for journaling, reflection, and personal growth.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            <Button 
              size="lg" 
              className="rounded-full group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => navigate('/auth')}
            >
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full border-purple-300 dark:border-purple-800"
              onClick={() => navigate('/dashboard')}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8"
        >
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-6 rounded-xl shadow-md flex flex-col items-center text-center"
          >
            <div className="bg-blue-100 dark:bg-blue-800/40 p-3 rounded-full mb-4">
              <BookText size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-serif mb-2">Daily Journaling</h3>
            <p className="text-muted-foreground text-sm">Express your thoughts and track your emotional journey</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 p-6 rounded-xl shadow-md flex flex-col items-center text-center"
          >
            <div className="bg-red-100 dark:bg-red-800/40 p-3 rounded-full mb-4">
              <Flame size={28} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-serif mb-2">Rant Mode</h3>
            <p className="text-muted-foreground text-sm">Let it all out in a safe space with supportive AI feedback</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 p-6 rounded-xl shadow-md flex flex-col items-center text-center"
          >
            <div className="bg-green-100 dark:bg-green-800/40 p-3 rounded-full mb-4">
              <RefreshCw size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-serif mb-2">Reset & Grow</h3>
            <p className="text-muted-foreground text-sm">Track your progress and growth through reflection</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Index;
