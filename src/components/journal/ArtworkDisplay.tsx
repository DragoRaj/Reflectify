
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MoodType } from './MoodSelector';

interface ArtworkDisplayProps {
  mood: MoodType;
  content: string;
  onRegenerate?: () => void;
}

const ArtworkDisplay = ({ mood, content, onRegenerate }: ArtworkDisplayProps) => {
  const [artworkUrl, setArtworkUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState<string | null>(null);
  const { toast } = useToast();

  const generateArtwork = React.useCallback(async () => {
    if (!mood || !content || content.length < 10) return;
    
    setIsLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      const response = await supabase.functions.invoke('generate-artwork', {
        body: { content, mood },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.imageUrl) {
        setArtworkUrl(response.data.imageUrl);
        setPrompt(response.data.prompt);
      } else {
        throw new Error('No artwork URL received');
      }
    } catch (error: any) {
      console.error('Error generating artwork:', error);
      toast({
        title: "Artwork generation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [mood, content, toast]);

  // Generate artwork when mood and content are available
  React.useEffect(() => {
    if (mood && content && content.length > 10 && !artworkUrl && !isLoading) {
      generateArtwork();
    }
  }, [mood, content, artworkUrl, isLoading, generateArtwork]);

  const handleRegenerate = () => {
    setArtworkUrl(null);
    setPrompt(null);
    generateArtwork();
    if (onRegenerate) onRegenerate();
  };

  const handleDownload = async () => {
    if (!artworkUrl) return;
    
    try {
      const response = await fetch(artworkUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflectify-art-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Artwork downloaded",
        description: "Your artwork has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the artwork",
        variant: "destructive",
      });
    }
  };

  if (!mood || !content || content.length < 10) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/30 dark:to-blue-950/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-serif mb-3 text-center">Your Reflective Artwork</h3>
          
          {prompt && (
            <p className="text-sm text-muted-foreground text-center mb-4 italic">
              "{prompt}"
            </p>
          )}
          
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square mb-4">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="absolute mt-16 text-sm text-muted-foreground">Creating your unique artwork...</p>
              </div>
            ) : artworkUrl ? (
              <img 
                src={artworkUrl} 
                alt="Generated artwork based on your journal" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No artwork generated yet</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Regenerate
            </Button>
            
            {artworkUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArtworkDisplay;
