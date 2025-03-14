
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface JournalEditorProps {
  mood: string | null;
}

const JournalEditor = ({ mood }: JournalEditorProps) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Simulated autosave function
  useEffect(() => {
    if (!content.trim()) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setLastSaved(new Date());
    
    toast({
      title: "Entry saved",
      description: "Your journal entry has been saved",
      duration: 3000,
    });
  };

  const getPromptForMood = () => {
    switch (mood) {
      case 'Happy':
        return 'What brought you joy today? What are you grateful for?';
      case 'Calm':
        return 'What is bringing you peace today? What makes you feel grounded?';
      case 'Neutral':
        return 'How is your day going? What's on your mind?';
      case 'Sad':
        return 'What's weighing on you today? How can you be gentle with yourself?';
      case 'Angry':
        return 'What triggered this feeling? What needs aren't being met?';
      case 'Anxious':
        return 'What worries are on your mind? What's one small step you can take?';
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
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">{getPromptForMood()}</p>
            <div className="min-h-[300px] relative">
              <textarea
                className="w-full h-full min-h-[300px] p-3 rounded-md bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-lg font-serif"
                placeholder="Start writing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : content ? (
                <span>Unsaved changes</span>
              ) : null}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!content.trim() || isSaving}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JournalEditor;
