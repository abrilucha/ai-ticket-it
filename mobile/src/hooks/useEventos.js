import { useState, useEffect, useRef, useCallback } from 'react';
import { listarEventos } from '../api/eventos.js';

/**
 * Hook para listar eventos con protección de condiciones de carrera (ignora respuestas obsoletas).
 */
export function useEventos(filtros = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchEventos = useCallback(async () => {
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listarEventos(filtros);
      // Solo actualizamos si este request sigue siendo el más reciente
      if (currentRequestId === latestRequestId.current) {
        setData(Array.isArray(result) ? result : []);
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al cargar eventos');
        setLoading(false);
      }
    }
  }, [filtros.q, filtros.categoria, filtros.orden, filtros.direccion, filtros.incluirRealizados]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  return {
    data,
    loading,
    error,
    reload: fetchEventos,
  };
}
