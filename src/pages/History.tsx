
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, History as HistoryIcon } from 'lucide-react';

const Timeline = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      setUser(data.session.user);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (session && event === 'SIGNED_IN') {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">Journal Timeline</h1>
          <p className="text-muted-foreground mt-2">
            Review your past journal entries and reflections.
          </p>
        </div>
        
        <Card className="bg-gradient-to-br from-green-50/80 to-teal-50/80 dark:from-green-950/30 dark:to-teal-950/30 mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-serif text-xl flex items-center">
              <HistoryIcon className="h-5 w-5 mr-2 text-green-500" />
              Your Journal Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JournalTimeline />
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Timeline;
