import { useState, useRef, useCallback } from 'react';
import { listarMisEventos } from '../api/eventos.js';

/**
 * Hook para consultar los eventos publicados por el organizador autenticado.
 * Cuenta con protección contra condiciones de carrera.
 */
export function useMisEventos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchMisEventos = useCallback(async () => {
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listarMisEventos();
      if (currentRequestId === latestRequestId.current) {
        setData(Array.isArray(result) ? result : []);
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al cargar tus eventos');
        setLoading(false);
      }
    }
  }, []);

  return {
    data,
    loading,
    error,
    reload: fetchMisEventos,
  };
}
