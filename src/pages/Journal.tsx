
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import MoodSelector from '@/components/journal/MoodSelector';
import JournalEditor from '@/components/journal/JournalEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkle } from 'lucide-react';
import { MoodType } from '@/components/journal/MoodSelector';

const Journal = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState(false);
  const { toast } = useToast();
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
      fetchDailyPrompt();
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

  const fetchDailyPrompt = async () => {
    try {
      setPromptLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
        },
        body: JSON.stringify({ promptType: 'daily' }),
      });
      
      const data = await response.json();
      setDailyPrompt(data.response);
    } catch (error) {
      console.error('Error fetching daily prompt:', error);
      setDailyPrompt('Take a moment to reflect on something that brought you joy recently.');
    } finally {
      setPromptLoading(false);
    }
  };

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
        className="max-w-3xl mx-auto pb-36" // Added padding at bottom for mood selector
      >
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Journal Entry</h1>
          <p className="text-muted-foreground mt-2">
            Express your thoughts and feelings in a safe space.
          </p>
        </div>
        
        <Card className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-serif text-xl flex items-center">
              <Sparkle className="h-5 w-5 mr-2 text-blue-500" />
              Today's Reflection Prompt
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={fetchDailyPrompt} 
              disabled={promptLoading}
              title="Refresh prompt"
            >
              {promptLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="italic text-muted-foreground">
              {promptLoading ? 'Loading your prompt...' : dailyPrompt}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
          <JournalEditor 
            mood={selectedMood} 
            isRantMode={false} 
            burnAfterReading={false} 
          />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Journal;
