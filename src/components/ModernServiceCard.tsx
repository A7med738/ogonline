import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Check, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernServiceCardProps {
  id: string;
  name: string;
  subtitle?: string;
  type: string;
  rating: number;
  address?: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
  icon?: React.ReactNode;
  features?: {
    label: string;
    available: boolean;
  }[];
  membershipInfo?: {
    label: string;
    available: boolean;
  }[];
  onViewLocation?: () => void;
  className?: string;
}

export const ModernServiceCard = ({
  id,
  name,
  subtitle,
  type,
  rating,
  address,
  phone,
  description,
  logoUrl,
  icon,
  features = [],
  membershipInfo = [],
  onViewLocation,
  className
}: ModernServiceCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "نادي رياضي": "bg-blue-100 text-blue-800",
      "مركز شباب": "bg-purple-100 text-purple-800",
      "نادي ثقافي": "bg-green-100 text-green-800",
      "مركز ترفيهي": "bg-orange-100 text-orange-800",
      "بنك": "bg-green-100 text-green-800",
      "مكتب بريد": "bg-red-100 text-red-800",
      "صراف آلي": "bg-blue-100 text-blue-800",
      "فعالية": "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className={cn(
      "w-full max-w-sm bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                {icon || <div className="h-6 w-6 bg-purple-600 rounded-full" />}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {name}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
              <div className="mt-2">
                <Badge className={cn("text-xs px-2 py-1 rounded-full", getTypeColor(type))}>
                  {type}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        {address && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{address}</span>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feature.label}</span>
                {feature.available ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Membership Info */}
        {membershipInfo.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-5 w-5 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full" />
              </div>
              <span className="text-sm font-medium text-gray-700">معلومات العضوية</span>
            </div>
            <div className="space-y-2">
              {membershipInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{info.label}</span>
                  {info.available ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Location Button */}
        {onViewLocation && (
          <Button
            onClick={onViewLocation}
            variant="outline"
            className="w-full bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 rounded-xl"
          >
            <span>عرض الموقع</span>
            <ExternalLink className="h-4 w-4 mr-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
