
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MoodSelector from '@/components/journal/MoodSelector';
import JournalEditor from '@/components/journal/JournalEditor';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <Layout>
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight md:leading-tight text-balance">
            Record your thoughts with intention
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A mindful space for journaling, reflection, and personal growth.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button size="lg" className="rounded-full group">
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
        <JournalEditor mood={selectedMood} />
        <JournalTimeline />
      </motion.section>
    </Layout>
  );
};

export default Index;
