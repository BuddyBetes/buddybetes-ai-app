import React from 'react';
import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';

interface EventVideoSectionProps {
  videoUrl: string;
}

const EventVideoSection = ({ videoUrl }: EventVideoSectionProps) => {
  const getEmbedUrl = (url: string) => {
    // Convert YouTube links to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // For other video platforms, return as-is
    return url;
  };

  return (
    <Card className="p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold">How to Enter the Raffle</h2>
      </div>
      
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
        <iframe
          src={getEmbedUrl(videoUrl)}
          title="Event Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  );
};

export default EventVideoSection;
