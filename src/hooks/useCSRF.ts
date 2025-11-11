'use client';

import { useState, useEffect } from 'react';

interface CSRFData {
  csrfToken: string;
  csrfSecret: string;
}

export function useCSRF() {
  const [csrfData, setCsrfData] = useState<CSRFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCSRFToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      setCsrfData({
        csrfToken: data.csrfToken,
        csrfSecret: data.csrfSecret,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const getCSRFHeaders = () => {
    if (!csrfData) return {};
    
    return {
      'x-csrf-token': csrfData.csrfToken,
      'x-csrf-secret': csrfData.csrfSecret,
    };
  };

  return {
    csrfData,
    loading,
    error,
    getCSRFHeaders,
    refetch: fetchCSRFToken,
  };
}
