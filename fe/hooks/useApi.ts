'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApiGet = <T = any>(
  endpoint: string | null,
  options?: UseApiOptions
): UseApiState<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!endpoint) return;

    const fetchData = async () => {
      setState({ data: null, isLoading: true, error: null });
      const response = await apiGet<T>(endpoint);

      if (response.success && response.data) {
        setState({ data: response.data, isLoading: false, error: null });
        options?.onSuccess?.(response.data);
      } else {
        const error = response.error || 'Failed to fetch data';
        setState({ data: null, isLoading: false, error });
        options?.onError?.(error);
        if (options?.showToast !== false) {
          toast.error(error);
        }
      }
    };

    fetchData();
  }, [endpoint, options]);

  return state;
};

export const useApiMutation = <T = any, D = any>(
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseApiOptions
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (endpoint: string, data?: D): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      setError(null);

      let response: ApiResponse<T>;

      switch (method) {
        case 'POST':
          response = await apiPost<T>(endpoint, data);
          break;
        case 'PATCH':
          response = await apiPatch<T>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiDelete<T>(endpoint);
          break;
        default:
          response = { success: false, error: 'Invalid method' };
      }

      if (response.success) {
        setIsLoading(false);
        options?.onSuccess?.(response.data);
        if (options?.showToast !== false) {
          const successMsg = response.message || `${method} successful!`;
          toast.success(successMsg);
        }
      } else {
        const errorMsg = response.error || `${method} failed`;
        setError(errorMsg);
        options?.onError?.(errorMsg);
        if (options?.showToast !== false) {
          toast.error(errorMsg);
        }
      }

      setIsLoading(false);
      return response;
    },
    [method, options]
  );

  return { mutate, isLoading, error };
};

export const useApiCreate = <T = any, D = any>(options?: UseApiOptions) => {
  return useApiMutation<T, D>('POST', options);
};

export const useApiUpdate = <T = any, D = any>(options?: UseApiOptions) => {
  return useApiMutation<T, D>('PATCH', options);
};

export const useApiDelete = <T = any>(options?: UseApiOptions) => {
  return useApiMutation<T>('DELETE', options);
};
