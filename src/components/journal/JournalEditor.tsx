
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface JournalEditorProps {
  mood: string | null;
  isRantMode?: boolean;
  burnAfterReading?: boolean;
}

const JournalEditor = ({ mood, isRantMode = false, burnAfterReading = false }: JournalEditorProps) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset when mood changes
  useEffect(() => {
    setContent('');
    setAiResponse(null);
    setLastSaved(null);
  }, [mood, isRantMode]);

  // Simulated autosave function
  useEffect(() => {
    if (!content.trim() || burnAfterReading) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [content, burnAfterReading]);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    try {
      setIsSaving(true);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Please log in to save your journal entry');
      }
      
      const userId = sessionData.session.user.id;
      
      if (!burnAfterReading) {
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: userId,
            content,
            mood,
            is_rant: isRantMode,
            burn_after_reading: false
          });
          
        if (error) throw error;
      }
      
      setLastSaved(new Date());
      
      toast({
        title: burnAfterReading ? "Not saved" : "Entry saved",
        description: burnAfterReading 
          ? "This entry won't be saved as you've selected 'Burn After Writing'" 
          : "Your journal entry has been saved",
        duration: 3000,
      });
      
      // If it's a rant, get AI response
      if (isRantMode && content.trim().length > 10 && !aiResponse) {
        await getAIResponse();
      }
      
      // Clear content after successful save
      if (!burnAfterReading) {
        setTimeout(() => {
          setContent('');
          setAiResponse(null);
          setLastSaved(null);
          
          // Navigate to history page if not in rant mode
          if (!isRantMode) {
            navigate('/history');
          }
        }, 1500);
      }
      
    } catch (error: any) {
      toast({
        title: "Error saving entry",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getAIResponse = async () => {
    try {
      setIsLoadingResponse(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          promptType: 'rant-response',
          content: content
        }),
      });
      
      const data = await response.json();
      setAiResponse(data.response);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setAiResponse('I understand you might be going through a difficult time. Remember that expressing your feelings is healthy, and tomorrow is a new day with new possibilities.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleClearEntry = () => {
    setContent('');
    setAiResponse(null);
    toast({
      title: "Entry cleared",
      description: "Your entry has been cleared",
    });
  };

  const getPromptForMood = () => {
    switch (mood) {
      case 'Happy':
        return 'What brought you joy today? What are you grateful for?';
      case 'Calm':
        return 'What is bringing you peace today? What makes you feel grounded?';
      case 'Neutral':
        return 'How is your day going? What\'s on your mind?';
      case 'Sad':
        return 'What\'s weighing on you today? How can you be gentle with yourself?';
      case 'Angry':
        return isRantMode 
          ? 'Go ahead and let it all out. What\'s frustrating you? Nothing is off limits here.'
          : 'What triggered this feeling? What needs aren\'t being met?';
      case 'Anxious':
        return 'What worries are on your mind? What\'s one small step you can take?';
      default:
        return 'What would you like to write about today?';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <Card className={isRantMode ? "border-red-400/50 shadow-md" : "glass-panel"}>
        <CardContent className="pt-6">
          {burnAfterReading && (
            <Alert className="mb-4 bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400">
              <AlertDescription className="flex items-center text-sm">
                <Trash className="h-4 w-4 mr-2" />
                This entry will not be saved. Burn After Writing is enabled.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">{getPromptForMood()}</p>
            <div className="min-h-[300px] relative">
              <textarea
                className="w-full h-full min-h-[300px] p-3 rounded-md bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-lg font-serif"
                placeholder={isRantMode ? "Let it all out here..." : "Start writing..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          
          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 bg-primary/5 rounded-md border border-primary/10"
            >
              <p className="text-sm font-medium mb-1">A note from your journal:</p>
              <p className="text-sm italic">{aiResponse}</p>
            </motion.div>
          )}
          
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 dark:from-blue-900/90 dark:via-purple-900/90 dark:to-pink-900/90 p-3 shadow-lg flex justify-between items-center">
            <div className="text-xs text-white">
              {burnAfterReading ? (
                <span className="text-amber-300">This entry will not be saved</span>
              ) : lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : content ? (
                <span>Unsaved changes</span>
              ) : null}
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={handleClearEntry}
                disabled={!content.trim()}
                className="flex items-center gap-2 bg-white text-gray-800 border-none hover:bg-gray-100"
              >
                <Trash size={20} />
                Clear
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!content.trim() || isSaving || isLoadingResponse}
                className="flex items-center gap-2 bg-white text-gray-800 border-none hover:bg-gray-100"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : isLoadingResponse ? 'Processing...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JournalEditor;
