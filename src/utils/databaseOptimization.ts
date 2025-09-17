// Database optimization utilities
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  select?: string;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  // Optimized query with caching
  async query<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{ data: T[] | null; error: any }> {
    const cacheKey = this.generateCacheKey(table, options);
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { data: cached.data, error: null };
    }

    try {
      let query = supabase.from(table);

      // Apply select
      if (options.select) {
        query = query.select(options.select);
      }

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Cache the result
      this.queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return { data, error: null };
    } catch (error) {
      console.error(`Database query error for table ${table}:`, error);
      return { data: null, error };
    }
  }

  // Batch queries for better performance
  async batchQuery<T>(
    queries: Array<{ table: string; options: QueryOptions }>
  ): Promise<Array<{ data: T[] | null; error: any }>> {
    const promises = queries.map(({ table, options }) => 
      this.query<T>(table, options)
    );

    return Promise.all(promises);
  }

  // Search across multiple tables
  async searchMultiple<T>(
    tables: Array<{ table: string; searchColumns: string[] }>,
    searchTerm: string,
    limit: number = 10
  ): Promise<Array<{ table: string; data: T[] }>> {
    const searchPromises = tables.map(async ({ table, searchColumns }) => {
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',');

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .or(searchConditions)
        .limit(limit);

      if (error) {
        console.error(`Search error for table ${table}:`, error);
        return { table, data: [] };
      }

      return { table, data: data || [] };
    });

    return Promise.all(searchPromises);
  }

  // Optimized count query
  async count(
    table: string,
    filters?: Record<string, any>
  ): Promise<{ count: number; error: any }> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return { count: count || 0, error: null };
    } catch (error) {
      console.error(`Count query error for table ${table}:`, error);
      return { count: 0, error };
    }
  }

  // Clear cache
  clearCache(): void {
    this.queryCache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(table: string, options?: QueryOptions): void {
    const cacheKey = this.generateCacheKey(table, options);
    this.queryCache.delete(cacheKey);
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.queryCache.size,
      entries: Array.from(this.queryCache.keys()),
    };
  }

  private generateCacheKey(table: string, options: QueryOptions): string {
    return `${table}:${JSON.stringify(options)}`;
  }
}

// Export singleton instance
export const dbOptimizer = DatabaseOptimizer.getInstance();

// Optimized query hooks
export const useOptimizedQuery = <T>(
  table: string,
  options: QueryOptions = {}
) => {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const result = await dbOptimizer.query<T>(table, options);
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [table, JSON.stringify(options)]);

  return { data, loading, error };
};

// Preload data for better performance
export const preloadData = async (
  table: string,
  options: QueryOptions = {}
): Promise<void> => {
  await dbOptimizer.query(table, options);
};

// Cache warming
export const warmCache = async (tables: Array<{ table: string; options: QueryOptions }>) => {
  const promises = tables.map(({ table, options }) => 
    preloadData(table, options)
  );
  
  await Promise.all(promises);
};
