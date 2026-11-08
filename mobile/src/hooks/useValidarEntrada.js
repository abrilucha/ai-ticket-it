import { useState, useCallback } from 'react';
import { obtenerCompra, utilizarCompra } from '../api/compras.js';

/**
 * Hook para la validación y canje manual de entradas por ID de compra.
 * Aísla la lógica para que la fase 4b (cámara) pueda conectarse directamente.
 */
export function useValidarEntrada() {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const verificar = useCallback(async (id) => {
    const idLimpio = (id || '').trim();
    if (!idLimpio) {
      setError('Por favor, ingresá el identificador de la compra.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompra(null);

    try {
      const data = await obtenerCompra(idLimpio);
      setCompra(data);
    } catch (err) {
      setError(err.message || 'No se pudo encontrar o verificar la compra');
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarUtilizada = useCallback(async () => {
    if (!compra?.id || actionLoading) return;
    setActionLoading(true);
    setError(null);

    try {
      const actualizada = await utilizarCompra(compra.id);
      setCompra(actualizada);
    } catch (err) {
      setError(err.message || 'Error al canjear la entrada');
    } finally {
      setActionLoading(false);
    }
  }, [compra, actionLoading]);

  const reset = useCallback(() => {
    setCompra(null);
    setError(null);
    setLoading(false);
    setActionLoading(false);
  }, []);

  return {
    compra,
    loading,
    actionLoading,
    error,
    verificar,
    marcarUtilizada,
    reset,
  };
}
