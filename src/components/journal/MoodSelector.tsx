
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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {moods.map(({ emoji, label }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <Button
              variant={selectedMood === label ? "default" : "outline"}
              className={`w-full h-auto flex flex-col py-3 gap-2 ${
                selectedMood === label ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelect(label)}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
