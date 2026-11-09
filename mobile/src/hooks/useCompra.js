import { useState, useRef, useCallback } from 'react';
import { obtenerCompra } from '../api/compras.js';

/**
 * Hook para consultar el detalle de una compra específica por ID
 * con protección contra respuestas viejas.
 */
export function useCompra(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchCompra = useCallback(async () => {
    if (!id) return;
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await obtenerCompra(id);
      if (currentRequestId === latestRequestId.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al obtener la compra');
        setLoading(false);
      }
    }
  }, [id]);

  return {
    data,
    loading,
    error,
    reload: fetchCompra,
  };
}
