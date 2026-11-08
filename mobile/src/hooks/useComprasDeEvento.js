import { useState, useRef, useCallback } from 'react';
import { listarComprasDeEvento } from '../api/eventos.js';

/**
 * Hook para consultar las compras registradas y la disponibilidad por tipo de un evento.
 * Protegido contra condiciones de carrera.
 */
export function useComprasDeEvento(eventoId) {
  const [data, setData] = useState({ compras: [], disponibilidadPorTipo: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchComprasEvento = useCallback(async () => {
    if (!eventoId) return;
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listarComprasDeEvento(eventoId);
      if (currentRequestId === latestRequestId.current) {
        setData({
          compras: Array.isArray(result?.compras) ? result.compras : [],
          disponibilidadPorTipo: Array.isArray(result?.disponibilidadPorTipo)
            ? result.disponibilidadPorTipo
            : [],
        });
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al cargar las compras del evento');
        setLoading(false);
      }
    }
  }, [eventoId]);

  return {
    compras: data.compras,
    disponibilidadPorTipo: data.disponibilidadPorTipo,
    loading,
    error,
    reload: fetchComprasEvento,
  };
}
