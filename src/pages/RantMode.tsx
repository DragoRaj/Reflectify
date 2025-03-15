
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Flame, AlertCircle, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RantMode = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    // Store current content before clearing
    const currentContent = content;
    
    // Add user message to chat
    setMessages([...messages, { type: 'user', content: currentContent }]);
    
    // Clear input immediately after submitting
    setContent('');
    
    try {
      setIsLoadingResponse(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      // Save the entry if not burn after reading
      if (!burnAfterReading && sessionData.session) {
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: sessionData.session.user.id,
            content: currentContent,
            mood: 'Angry',
            is_rant: true,
            burn_after_reading: burnAfterReading
          });
          
        if (error) throw error;
      }
      
      // Get AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          promptType: 'rant-response',
          content: currentContent
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { type: 'assistant', content: data.response || "I understand you might be going through a difficult time. Remember that expressing your feelings is healthy, and tomorrow is a new day with new possibilities." }]);
      
      if (burnAfterReading) {
        toast({
          title: "Rant recorded but not saved",
          description: "Your message wasn't saved as you've selected 'Burn After Writing'",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      // Add a fallback AI response in case of error
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: "I'm having trouble responding right now, but I'm here to listen. Feel free to continue sharing your thoughts." 
      }]);
      
      toast({
        title: "Error",
        description: error.message || "An error occurred with the AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResponse(false);
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">Rant Mode</h1>
          <p className="text-muted-foreground mt-2">
            A safe space to let out your frustrations. Our AI will listen and provide supportive responses.
          </p>
        </div>
        
        <Card className="border-red-400/50 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl font-serif text-red-600 dark:text-red-400">
              <Flame className="h-5 w-5 mr-2 text-red-500" />
              Rant Space
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
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
                  />
                </div>
              </div>
            </div>
            
            {burnAfterReading && (
              <Alert className="mb-4 bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400">
                <AlertDescription className="flex items-center text-sm">
                  <Flame className="h-4 w-4 mr-2" />
                  Your entries won't be saved. Burn After Writing is enabled.
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-4 p-3 rounded-lg bg-white/70 dark:bg-black/20 border border-border h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  <Flame className="h-10 w-10 mx-auto mb-3 text-red-400/50" />
                  <p>Feel free to rant. I'm here to listen and support you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-red-100 dark:bg-red-900/30 ml-auto' 
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let it all out here..."
                className="flex-1 resize-none h-[80px] bg-white/80 dark:bg-black/20"
              />
              <Button 
                type="submit" 
                className="h-[80px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                disabled={!content.trim() || isLoadingResponse}
              >
                {isLoadingResponse ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default RantMode;
