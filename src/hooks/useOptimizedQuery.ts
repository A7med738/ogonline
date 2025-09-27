import React from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedQueryOptions<T> {
  table: string;
  select?: string; // column selection string
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  reactQueryOptions?: Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryFn' | 'queryKey'>;
}

export function useOptimizedQuery<T = any>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  enabled = true,
  reactQueryOptions,
}: OptimizedQueryOptions<T>) {
  return useQuery<T, Error>({
    queryKey: [table, select, filters, orderBy, limit],
    queryFn: async () => {
      // Cast to any to avoid strict typed table name unions
      let query: any = (supabase.from as any)(table as any).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key as any, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key as any, value);
          } else {
            query = query.eq(key as any, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...(reactQueryOptions as any),
  });
}

// Specialized hooks for common queries
export function useMalls(limit = 50) {
  return useOptimizedQuery({
    table: 'malls',
    select: 'id, name, description, image_url, rating, is_open, closing_time, address, created_at',
    orderBy: { column: 'created_at', ascending: false },
    limit,
  });
}

export function useNews(limit = 20) {
  return useOptimizedQuery({
    table: 'news',
    select: 'id, title, summary, image_url, category, published_at',
    orderBy: { column: 'published_at', ascending: false },
    limit,
  });
}

export function usePoliceStations(limit = 50) {
  return useOptimizedQuery({
    table: 'police_stations',
    select: 'id, name, area, address, description, phone, rating, latitude, longitude',
    limit,
  });
}

export function useCityDepartments(limit = 50) {
  return useOptimizedQuery({
    table: 'city_departments',
    select: 'id, title, description, phone, email, hours, latitude, longitude',
    limit,
  });
}

export function useSchools(limit = 50) {
  return useOptimizedQuery({
    table: 'schools',
    select: 'id, name, description, type, address, phone, rating, image_url, is_active',
    filters: { is_active: true },
    orderBy: { column: 'created_at', ascending: false },
    limit,
  });
}

export function useHospitals(limit = 50) {
  return useOptimizedQuery({
    table: 'hospitals',
    select: 'id, name, description, address, phone, rating, image_url, is_active',
    filters: { is_active: true },
    orderBy: { column: 'created_at', ascending: false },
    limit,
  });
}
