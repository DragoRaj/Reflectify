import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Flame, BookText, History as HistoryIcon, Sparkle } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
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
      
      // Get the user's name from metadata
      if (data.session.user.user_metadata && data.session.user.user_metadata.name) {
        setUserName(data.session.user.user_metadata.name);
      } else {
        // Fallback to email prefix if no name
        setUserName(data.session.user.email?.split('@')[0] || 'Friend');
      }
      
      setLoading(false);
      
      // Get previously used prompts from localStorage
      const today = new Date().toDateString();
      const storedPrompts = localStorage.getItem(`usedPrompts_${today}`);
      if (storedPrompts) {
        setUsedPrompts(JSON.parse(storedPrompts));
      }
      
      fetchDailyPrompt();
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (session && event === 'SIGNED_IN') {
          setUser(session.user);
          // Set user name on auth state change
          if (session.user.user_metadata && session.user.user_metadata.name) {
            setUserName(session.user.user_metadata.name);
          } else {
            setUserName(session.user.email?.split('@')[0] || 'Friend');
          }
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
      
      // Get today's date for tracking
      const today = new Date().toDateString();
      
      // Check if we've already used 3 prompts today
      const storedPrompts = localStorage.getItem(`usedPrompts_${today}`);
      let currentUsedPrompts: string[] = storedPrompts ? JSON.parse(storedPrompts) : [];
      
      if (currentUsedPrompts.length >= 3 && dailyPrompt) {
        // If we already have 3 prompts today, cycle through the existing ones
        const nextPromptIndex = (currentUsedPrompts.indexOf(dailyPrompt) + 1) % 3;
        setDailyPrompt(currentUsedPrompts[nextPromptIndex]);
        setPromptLoading(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
        },
        body: JSON.stringify({ promptType: 'daily' }),
      });
      
      const data = await response.json();
      const newPrompt = data.response;
      
      // Make sure we don't get the same prompt again
      if (!currentUsedPrompts.includes(newPrompt)) {
        currentUsedPrompts.push(newPrompt);
        // Keep only the latest 3 prompts
        if (currentUsedPrompts.length > 3) {
          currentUsedPrompts = currentUsedPrompts.slice(-3);
        }
        
        // Store in localStorage
        localStorage.setItem(`usedPrompts_${today}`, JSON.stringify(currentUsedPrompts));
        setUsedPrompts(currentUsedPrompts);
      }
      
      setDailyPrompt(newPrompt);
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
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl">Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{userName}</span></h1>
        <p className="text-muted-foreground mt-2">Your mindful journey continues today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl flex items-center">
                <Sparkle className="h-5 w-5 mr-2 text-blue-500" />
                Today's Reflection
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
              {usedPrompts.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  {usedPrompts.length >= 3 ? 
                    "You've reached your daily limit of 3 new prompts. Cycling through existing ones." :
                    `${3 - usedPrompts.length} more unique ${usedPrompts.length >= 2 ? 'prompt' : 'prompts'} available today.`}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Link to="/journal">
                  <BookText className="h-4 w-4 mr-2" />
                  Write in Journal
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl flex items-center">
                <Flame className="h-5 w-5 mr-2 text-red-500" />
                Need to Vent?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sometimes we need a safe space to express our frustrations. Rant Mode provides a judgment-free zone where you can let it all out.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                <Link to="/rant-mode">
                  <Flame className="h-4 w-4 mr-2" />
                  Enter Rant Mode
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50/80 to-teal-50/80 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-serif text-xl flex items-center">
              <HistoryIcon className="h-5 w-5 mr-2 text-green-500" />
              Your Journey So Far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review your past entries and see how far you've come in your reflective journey.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/history">
                <HistoryIcon className="h-4 w-4 mr-2" />
                View Timeline
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
