import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook untuk fetching data dari API.
 * @param {string|null} url  - endpoint URL (null = skip fetch)
 * @param {any[]}       deps - dependensi tambahan untuk re-fetch
 */
export default function useFetch(url, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get(url)
      .then(res => {
        if (!cancelled) setData(res);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  return { data, loading, error };
}
