import { supabase } from "@/integrations/supabase/client";

export interface SerpMapResult {
  title: string;
  address: string;
  rating?: number;
  phone?: string;
  website?: string;
  position: {
    latitude: number;
    longitude: number;
  };
  type: string;
  distance?: string;
}

export interface SerpMapResponse {
  search_metadata: {
    status: string;
  };
  search_parameters: {
    engine: string;
    q: string;
    location?: string;
  };
  local_results?: SerpMapResult[];
}

class SerpApiService {
  private async getApiKey(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('get-serp-api-key');
    
    if (error) {
      throw new Error('Failed to get SerpAPI key');
    }
    
    return data.apiKey;
  }

  async searchNearbyPoliceStations(
    latitude: number, 
    longitude: number, 
    radius: number = 10000
  ): Promise<SerpMapResult[]> {
    try {
      const apiKey = await this.getApiKey();
      
      const params = new URLSearchParams({
        engine: 'google_maps',
        q: 'police station',
        ll: `@${latitude},${longitude},${radius}m`,
        type: 'search',
        api_key: apiKey
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SerpMapResponse = await response.json();
      
      if (data.search_metadata.status !== 'Success') {
        throw new Error('SerpAPI search failed');
      }
      
      return data.local_results || [];
    } catch (error) {
      console.error('Error searching nearby police stations:', error);
      throw error;
    }
  }

  async searchLocation(query: string): Promise<SerpMapResult[]> {
    try {
      const apiKey = await this.getApiKey();
      
      const params = new URLSearchParams({
        engine: 'google_maps',
        q: query,
        type: 'search',
        api_key: apiKey
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SerpMapResponse = await response.json();
      
      if (data.search_metadata.status !== 'Success') {
        throw new Error('SerpAPI search failed');
      }
      
      return data.local_results || [];
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const apiKey = await this.getApiKey();
      
      const params = new URLSearchParams({
        engine: 'google_reverse_geocoding',
        lat: latitude.toString(),
        lng: longitude.toString(),
        api_key: apiKey
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.search_metadata.status !== 'Success') {
        throw new Error('SerpAPI reverse geocoding failed');
      }
      
      return data.results?.[0]?.formatted_address || 'Unknown location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }
}

export const serpApiService = new SerpApiService();