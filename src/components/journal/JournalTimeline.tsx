
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Dummy data for the timeline
const dummyEntries = [
  {
    id: 1,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    mood: 'Happy',
    preview: 'Today was a wonderful day. I accomplished so much and felt really productive...',
  },
  {
    id: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    mood: 'Calm',
    preview: 'I practiced meditation this morning and it really helped me center myself...',
  },
  {
    id: 3,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    mood: 'Anxious',
    preview: 'Work has been overwhelming lately. I need to remember to take breaks...',
  },
];

// Get mood emoji
const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'Happy': return '😊';
    case 'Calm': return '😌';
    case 'Neutral': return '😐';
    case 'Sad': return '😔';
    case 'Angry': return '😡';
    case 'Anxious': return '😰';
    default: return '📝';
  }
};

const JournalTimeline = () => {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-serif font-medium mb-5">Your Journal Entries</h2>
      
      <div className="space-y-4">
        {dummyEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <span>{entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <Badge variant="outline">{getMoodEmoji(entry.mood)} {entry.mood}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(entry.date, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-muted-foreground">{entry.preview}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JournalTimeline;
