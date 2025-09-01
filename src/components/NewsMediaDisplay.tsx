import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsMediaItem {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  file_name?: string;
  order_priority: number;
}

interface NewsMediaDisplayProps {
  media: NewsMediaItem[];
  className?: string;
}

export const NewsMediaDisplay: React.FC<NewsMediaDisplayProps> = ({
  media,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!media || media.length === 0) return null;

  const sortedMedia = media.sort((a, b) => a.order_priority - b.order_priority);
  const currentMedia = sortedMedia[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedMedia.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Media Display */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {currentMedia.media_type === 'image' ? (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={currentMedia.media_url}
                alt={currentMedia.file_name || 'صورة الخبر'}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <img
                src={currentMedia.media_url}
                alt={currentMedia.file_name || 'صورة الخبر'}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : (
          <video
            src={currentMedia.media_url}
            controls
            className="w-full h-full"
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            poster={currentMedia.media_url}
          >
            المتصفح لا يدعم تشغيل الفيديو
          </video>
        )}

        {/* Navigation Arrows - Only show if more than one media item */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={prevMedia}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextMedia}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {sortedMedia.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {sortedMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if more than one media item */}
      {sortedMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedMedia.map((mediaItem, index) => (
            <button
              key={mediaItem.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                currentIndex === index
                  ? "border-primary shadow-md"
                  : "border-muted hover:border-primary/50"
              )}
            >
              {mediaItem.media_type === 'image' ? (
                <img
                  src={mediaItem.media_url}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};