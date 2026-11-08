import { useState, useEffect, useCallback } from 'react';
import { obtenerEvento } from '../api/eventos.js';

/**
 * Hook para consultar el detalle de un evento por ID.
 */
export function useEvento(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvento = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const result = await obtenerEvento(id);
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar el detalle del evento');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvento();
  }, [fetchEvento]);

  return {
    data,
    loading,
    error,
    reload: fetchEvento,
  };
}
