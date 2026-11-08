import { useState, useCallback } from 'react';
import { utilizarCompra } from '../api/compras.js';

/**
 * Hook compartido para marcar compras como utilizadas.
 * Gestiona el estado de carga y error para evitar dobles toques concurrentes.
 */
export function useUtilizarCompra() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const marcarUtilizada = useCallback(async (compraId) => {
    if (loading || !compraId) return null;
    setLoading(true);
    setError(null);

    try {
      const resultado = await utilizarCompra(compraId);
      return resultado;
    } catch (err) {
      setError(err.message || 'Error al validar la entrada');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    loading,
    error,
    setError,
    marcarUtilizada,
  };
}
