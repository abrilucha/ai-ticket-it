import { useState, useRef, useCallback } from 'react';
import { listarMisCompras } from '../api/compras.js';

/**
 * Hook para listar las compras del usuario con protección contra respuestas viejas
 * y ordenamiento por fecha de creación (de más reciente a más antigua).
 */
export function useMisCompras() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchCompras = useCallback(async () => {
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listarMisCompras();
      if (currentRequestId === latestRequestId.current) {
        const list = Array.isArray(result) ? result : [];
        // Ordenar de más reciente a más antigua por createdAt
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setData(list);
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al cargar tus compras');
        setLoading(false);
      }
    }
  }, []);

  return {
    data,
    loading,
    error,
    reload: fetchCompras,
  };
}
