
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import MoodSelector from '@/components/journal/MoodSelector';
import JournalEditor from '@/components/journal/JournalEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkle } from 'lucide-react';
import { MoodType } from '@/components/journal/MoodSelector';

// Default prompts in case API fails
const DEFAULT_PROMPTS = [
  "Take a moment to reflect on something that brought you joy recently.",
  "What are you grateful for today? List three things and why they matter to you.",
  "What's one small victory you've had recently that deserves celebration?"
];

const Journal = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [dailyPrompts, setDailyPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      setUser(data.session.user);
      
      // Get the user's name from metadata
      if (data.session.user.user_metadata && data.session.user.user_metadata.name) {
        setUserName(data.session.user.user_metadata.name);
      }
      
      setLoading(false);
      
      // Check if we already have prompts for today in localStorage
      const today = new Date().toISOString().split('T')[0];
      const storedPromptsData = localStorage.getItem('dailyPrompts');
      
      if (storedPromptsData) {
        const storedPrompts = JSON.parse(storedPromptsData);
        if (storedPrompts.date === today && storedPrompts.prompts.length > 0) {
          setDailyPrompts(storedPrompts.prompts);
          setDailyPrompt(storedPrompts.prompts[0]);
          return;
        }
      }
      
      // If no stored prompts for today, fetch new ones
      fetchDailyPrompts();
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (session && event === 'SIGNED_IN') {
          setUser(session.user);
          
          // Get the user's name from metadata on auth state change
          if (session.user.user_metadata && session.user.user_metadata.name) {
            setUserName(session.user.user_metadata.name);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchDailyPrompts = async () => {
    try {
      setPromptLoading(true);
      const prompts = [];
      
      // Generate 3 prompts
      for (let i = 0; i < 3; i++) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData.session?.access_token;
          
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ promptType: 'daily' }),
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          prompts.push(data.response);
        } catch (error) {
          console.error('Error fetching prompt:', error);
          prompts.push(DEFAULT_PROMPTS[i % DEFAULT_PROMPTS.length]);
        }
        
        // Small delay between requests
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Store prompts for today
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('dailyPrompts', JSON.stringify({
        date: today,
        prompts
      }));
      
      setDailyPrompts(prompts);
      setDailyPrompt(prompts[0]);
      setCurrentPromptIndex(0);
    } catch (error) {
      console.error('Error fetching daily prompts:', error);
      setDailyPrompts(DEFAULT_PROMPTS);
      setDailyPrompt(DEFAULT_PROMPTS[0]);
    } finally {
      setPromptLoading(false);
    }
  };

  const cyclePrompt = () => {
    if (dailyPrompts.length === 0) return;
    
    const nextIndex = (currentPromptIndex + 1) % dailyPrompts.length;
    setCurrentPromptIndex(nextIndex);
    setDailyPrompt(dailyPrompts[nextIndex]);
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
          <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {userName ? `${userName}'s Journal` : 'Journal Entry'}
          </h1>
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
              onClick={dailyPrompts.length > 0 ? cyclePrompt : fetchDailyPrompts} 
              disabled={promptLoading}
              title={dailyPrompts.length > 0 ? "Cycle through prompts" : "Refresh prompt"}
            >
              {promptLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.p 
                key={dailyPrompt}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="italic text-muted-foreground"
              >
                {promptLoading ? 'Loading your prompt...' : dailyPrompt}
              </motion.p>
            </AnimatePresence>
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
