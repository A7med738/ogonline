import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Heart, Share2, MessageCircle, ArrowRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ModernNewsCardProps {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  onReadMore?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const ModernNewsCard = ({
  id,
  title,
  summary,
  content,
  category,
  publishedAt,
  imageUrl,
  likesCount = 0,
  viewsCount = 0,
  commentsCount = 0,
  onReadMore,
  onLike,
  onShare,
  onComment,
  className,
  isCompact = false
}: ModernNewsCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "أخبار عامة": "bg-blue-100 text-blue-800",
      "أخبار محلية": "bg-green-100 text-green-800",
      "أخبار اقتصادية": "bg-yellow-100 text-yellow-800",
      "أخبار رياضية": "bg-orange-100 text-orange-800",
      "أخبار ثقافية": "bg-purple-100 text-purple-800",
      "أخبار سياسية": "bg-red-100 text-red-800",
      "أخبار تقنية": "bg-indigo-100 text-indigo-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("w-full", className)}
    >
      <Card className={cn(
        "bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300 overflow-hidden",
        isCompact ? "max-w-sm" : "max-w-md"
      )}>
        {/* Image Section */}
        {imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <Badge className={cn(
                "text-xs px-2 py-1 rounded-full border-0 shadow-lg",
                getCategoryColor(category)
              )}>
                {category}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className={cn("pb-3", !imageUrl && "pt-6")}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-gray-900 leading-tight mb-2",
                isCompact ? "text-sm line-clamp-2" : "text-lg line-clamp-2"
              )}>
                {title}
              </h3>
              
              {!imageUrl && (
                <div className="mb-2">
                  <Badge className={cn(
                    "text-xs px-2 py-1 rounded-full border-0",
                    getCategoryColor(category)
                  )}>
                    {category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          <p className={cn(
            "text-gray-600 leading-relaxed",
            isCompact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
          )}>
            {summary}
          </p>

          {/* Time and Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatTimeAgo(publishedAt)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{viewsCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{commentsCount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={onReadMore}
              variant="outline"
              size="sm"
              className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 rounded-xl text-xs px-3 py-1"
            >
              <span>اقرأ المزيد</span>
              <ArrowRight className="h-3 w-3 mr-1" />
            </Button>

            <div className="flex items-center space-x-1">
              <Button
                onClick={onLike}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 text-gray-500 hover:text-red-500"
              >
                <Heart className="h-3 w-3" />
              </Button>
              <Button
                onClick={onShare}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-500 hover:text-blue-500"
              >
                <Share2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={onComment}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-50 text-gray-500 hover:text-green-500"
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
