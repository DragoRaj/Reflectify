
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import JournalEditor from '@/components/journal/JournalEditor';
import MoodSelector from '@/components/journal/MoodSelector';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Flame, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [isRantMode, setIsRantMode] = useState(false);
  const [burnAfterReading, setBurnAfterReading] = useState(false);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const toggleRantMode = () => {
    setIsRantMode(!isRantMode);
    if (!isRantMode) {
      setSelectedMood('Angry');
      toast({
        title: 'Rant Mode Activated',
        description: 'Go ahead and let it all out. Your feelings are valid.',
      });
    } else {
      setSelectedMood(null);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl">Welcome, {user?.email}</h1>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-serif text-xl">Today's Reflection Prompt</CardTitle>
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
      </motion.div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Flame className={`h-5 w-5 ${isRantMode ? 'text-red-500' : 'text-muted-foreground'}`} />
              <Label htmlFor="rant-mode" className="flex-1">Rant Mode</Label>
              <Switch 
                id="rant-mode" 
                checked={isRantMode} 
                onCheckedChange={toggleRantMode} 
              />
            </div>
            
            {isRantMode && (
              <div className="flex items-start space-x-2 mb-4 bg-muted/50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm">In Rant Mode, you can freely express your frustrations.</p>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="burn-after-reading" className="text-xs text-muted-foreground">
                      Burn After Writing
                    </Label>
                    <Switch 
                      id="burn-after-reading" 
                      checked={burnAfterReading} 
                      onCheckedChange={setBurnAfterReading} 
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="entries">Your Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="space-y-4">
          <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
          <JournalEditor 
            mood={selectedMood} 
            isRantMode={isRantMode} 
            burnAfterReading={burnAfterReading} 
          />
        </TabsContent>
        
        <TabsContent value="entries">
          <JournalTimeline />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Dashboard;
