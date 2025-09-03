import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CreateEmbeddingParams {
  content: string;
  content_type: 'news' | 'police_station' | 'department' | 'emergency_contact';
  content_id: string;
  metadata?: any;
}

export const useEmbeddings = () => {
  const { toast } = useToast();

  const createEmbedding = useCallback(async (params: CreateEmbeddingParams) => {
    try {
      console.log('Creating embedding for:', params.content_type, params.content_id);
      
      const { data, error } = await supabase.functions.invoke('create-embeddings', {
        body: params
      });

      if (error) {
        console.error('Error creating embedding:', error);
        throw error;
      }

      console.log('Embedding created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Failed to create embedding:', error);
      toast({
        title: "تحذير",
        description: "فشل في إنشاء فهرسة النص للبحث الذكي",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const createNewsEmbedding = useCallback(async (newsItem: any) => {
    const content = `${newsItem.title}\n${newsItem.summary || ''}\n${newsItem.content || ''}`;
    return createEmbedding({
      content,
      content_type: 'news',
      content_id: newsItem.id,
      metadata: {
        category: newsItem.category,
        published_at: newsItem.published_at
      }
    });
  }, [createEmbedding]);

  const createPoliceStationEmbedding = useCallback(async (station: any) => {
    const content = `${station.name} ${station.area} ${station.address || ''} ${station.description || ''}`;
    return createEmbedding({
      content,
      content_type: 'police_station',
      content_id: station.id,
      metadata: {
        area: station.area,
        latitude: station.latitude,
        longitude: station.longitude
      }
    });
  }, [createEmbedding]);

  const createDepartmentEmbedding = useCallback(async (department: any) => {
    const content = `${department.title} ${department.description || ''} ${department.phone} ${department.email}`;
    return createEmbedding({
      content,
      content_type: 'department',
      content_id: department.id,
      metadata: {
        phone: department.phone,
        email: department.email,
        hours: department.hours,
        latitude: department.latitude,
        longitude: department.longitude
      }
    });
  }, [createEmbedding]);

  const createEmergencyContactEmbedding = useCallback(async (contact: any) => {
    const content = `${contact.title} ${contact.description || ''} ${contact.number} ${contact.type}`;
    return createEmbedding({
      content,
      content_type: 'emergency_contact',
      content_id: contact.id,
      metadata: {
        type: contact.type,
        number: contact.number
      }
    });
  }, [createEmbedding]);

  return {
    createEmbedding,
    createNewsEmbedding,
    createPoliceStationEmbedding,
    createDepartmentEmbedding,
    createEmergencyContactEmbedding
  };
};