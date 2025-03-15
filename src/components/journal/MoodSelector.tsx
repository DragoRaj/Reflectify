
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😰', label: 'Anxious' },
];

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  selectedMood: string | null;
}

const MoodSelector = ({ onSelect, selectedMood }: MoodSelectorProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3">How are you feeling today?</h3>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 left-0 right-0 z-10 bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-900/90 dark:to-purple-900/90 p-3 shadow-lg flex justify-center overflow-x-auto"
      >
        <div className="flex gap-2 md:gap-4">
          {moods.map(({ emoji, label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedMood === label ? "default" : "ghost"}
                className={`h-auto flex flex-col py-2 px-3 rounded-full ${
                  selectedMood === label 
                    ? "bg-white text-gray-800 shadow-md" 
                    : "text-white hover:bg-white/20"
                }`}
                onClick={() => onSelect(label)}
              >
                <span className="text-3xl mb-1">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MoodSelector;
