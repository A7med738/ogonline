import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationError {
  code: number;
  message: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      const geoError = {
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      };
      setError(geoError);
      toast.error('خدمة تحديد الموقع غير مدعومة في هذا المتصفح');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        setLoading(false);
        toast.success('تم تحديد موقعك بنجاح');
      },
      (error) => {
        const geoError = {
          code: error.code,
          message: error.message
        };
        setError(geoError);
        setLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('تم رفض إذن الوصول للموقع');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('معلومات الموقع غير متاحة');
            break;
          case error.TIMEOUT:
            toast.error('انتهت مهلة تحديد الموقع');
            break;
          default:
            toast.error('حدث خطأ في تحديد الموقع');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation
  };
};