
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type MoodType = 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Angry' | 'Anxious' | null;

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood: MoodType;
}

const moods = [
  { id: 'Happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/40 dark:hover:bg-yellow-800/30' },
  { id: 'Calm', emoji: '😌', label: 'Calm', color: 'bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 dark:hover:bg-blue-800/30' },
  { id: 'Neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-900/20 dark:border-gray-700/40 dark:hover:bg-gray-800/30' },
  { id: 'Sad', emoji: '😔', label: 'Sad', color: 'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/20 dark:border-purple-700/40 dark:hover:bg-purple-800/30' },
  { id: 'Angry', emoji: '😡', label: 'Angry', color: 'bg-red-100 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:border-red-700/40 dark:hover:bg-red-800/30' },
  { id: 'Anxious', emoji: '😰', label: 'Anxious', color: 'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700/40 dark:hover:bg-green-800/30' },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood }) => {
  useEffect(() => {
    // Clear selection if navigating between pages
    return () => {
      onSelect(null);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {moods.map((mood, index) => (
              <motion.div
                key={mood.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Button
                  variant="outline"
                  className={`h-auto px-4 py-6 flex flex-col items-center justify-center gap-2 border-2 ${
                    selectedMood === mood.id
                      ? `ring-2 ring-primary ${mood.color}`
                      : `${mood.color} hover:scale-105 transition-transform`
                  }`}
                  onClick={() => onSelect(mood.id as MoodType)}
                >
                  <motion.div 
                    className="text-4xl"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {mood.emoji}
                  </motion.div>
                  <span className="font-medium">{mood.label}</span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodSelector;
