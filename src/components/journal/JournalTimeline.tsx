
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Get mood emoji with animation
const MoodEmoji = ({ mood }: { mood: string }) => {
  let emoji;
  
  switch (mood) {
    case 'Happy': emoji = '😊'; break;
    case 'Calm': emoji = '😌'; break;
    case 'Neutral': emoji = '😐'; break;
    case 'Sad': emoji = '😔'; break;
    case 'Angry': emoji = '😡'; break;
    case 'Anxious': emoji = '😰'; break;
    default: emoji = '📝';
  }
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mr-1"
    >
      {emoji}
    </motion.span>
  );
};

const JournalTimeline = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No journal entries yet. Start writing to see your entries here.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-serif font-medium mb-5">Your Journal Entries</h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="transition-all"
            >
              <Card className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span>{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <Badge variant={entry.is_rant ? "destructive" : "outline"} className="flex items-center">
                          <MoodEmoji mood={entry.mood} /> {entry.mood}
                          {entry.is_rant && " (Rant)"}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground">{entry.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JournalTimeline;
