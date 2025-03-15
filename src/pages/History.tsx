
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, History as HistoryIcon, ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Timeline = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const generateDayImage = async () => {
    if (generatingImage) return;
    
    try {
      setGeneratingImage(true);
      
      // Get recent entry contents
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      if (!entries || entries.length === 0) {
        toast({
          title: "No entries found",
          description: "Write some journal entries first to generate a day image.",
          variant: "destructive"
        });
        return;
      }
      
      // Combine recent entries for context
      const combinedContent = entries
        .map(entry => entry.content)
        .join(" ");
      
      // Use the most recent mood
      const latestMood = entries[0].mood;
      
      // Call the artwork generation function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      const response = await supabase.functions.invoke('generate-artwork', {
        body: { 
          content: combinedContent,
          mood: latestMood,
          isDaily: true
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.imageUrl) {
        // Download the image
        const imageUrl = response.data.imageUrl;
        const imageBlob = await fetch(imageUrl).then(r => r.blob());
        const url = window.URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-reflection-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Daily image created",
          description: "Your daily reflection image has been downloaded.",
        });
      } else {
        throw new Error('No artwork URL received');
      }
    } catch (error: any) {
      console.error('Error generating daily image:', error);
      toast({
        title: "Image generation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
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
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">Journal Timeline</h1>
            <p className="text-muted-foreground mt-2">
              Review your past journal entries and reflections.
            </p>
          </div>
          <Button 
            onClick={generateDayImage}
            disabled={generatingImage}
            variant="outline"
            className="flex items-center gap-2"
          >
            {generatingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Generate Day Image
          </Button>
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
