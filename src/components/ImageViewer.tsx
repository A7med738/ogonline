import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  showZoomButton?: boolean;
  showDownloadButton?: boolean;
  children?: React.ReactNode;
}

const ImageViewer = ({
  src,
  alt = "Image",
  className,
  showZoomButton = true,
  showDownloadButton = true,
  children
}: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          {children || (
            <img
              src={src}
              alt={alt}
              className={cn("w-full h-full object-cover", className)}
            />
          )}
          {showZoomButton && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" variant="secondary">
                <ZoomIn className="w-4 h-4 mr-2" />
                تكبير
              </Button>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="relative">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[90vh] object-contain"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {showDownloadButton && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="bg-black/50 hover:bg-black/70"
              >
                <Download className="w-4 h-4 mr-2" />
                تحميل
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="bg-black/50 hover:bg-black/70"
            >
              <X className="w-4 h-4 mr-2" />
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
