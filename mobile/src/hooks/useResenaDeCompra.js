import { useState, useEffect, useCallback, useRef } from 'react';
import { obtenerResenaDeCompra } from '../api/resenas.js';

/**
 * useResenaDeCompra
 * Hook para cargar la reseña asociada a una compra puntual.
 * Si no existe reseña, la propiedad `resena` es null y no arroja error.
 */
export function useResenaDeCompra(compraId) {
  const [resena, setResena] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    if (!compraId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await obtenerResenaDeCompra(compraId);
      if (isMountedRef.current) {
        setResena(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Error al obtener la reseña de la compra');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [compraId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    resena,
    loading,
    error,
    reload: cargar,
  };
}
