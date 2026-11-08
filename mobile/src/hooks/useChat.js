import { useState, useEffect, useCallback, useRef } from 'react';
import { listarMensajes, enviarMensaje } from '../api/mensajes.js';

/**
 * useChat
 * Hook para gestionar el chat de una compra en tiempo real.
 * Soporta carga inicial, recarga silenciosa para polling y envío con protección de estado.
 */
export function useChat(compraId) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Control para ignorar respuestas de solicitudes desactualizadas o desmontajes
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cargar = useCallback(
    async ({ silencioso = false, isRefresh = false } = {}) => {
      if (!compraId) return;

      const currentReq = ++requestIdRef.current;

      if (!silencioso) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      }

      try {
        const data = await listarMensajes(compraId);
        if (isMountedRef.current && currentReq === requestIdRef.current) {
          setMensajes(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current && currentReq === requestIdRef.current) {
          // Solo mostrar banner de error si no es polling silencioso
          if (!silencioso) {
            setError(err.message || 'Error al cargar mensajes del chat');
          }
        }
      } finally {
        if (isMountedRef.current && currentReq === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [compraId]
  );

  useEffect(() => {
    cargar({ silencioso: false });
  }, [cargar]);

  const enviar = useCallback(
    async (texto) => {
      if (!compraId || !texto || !texto.trim() || enviando) return null;
      setEnviando(true);
      setError(null);

      try {
        const nuevoMensaje = await enviarMensaje(compraId, texto.trim());
        if (isMountedRef.current) {
          setMensajes((prev) => [...prev, nuevoMensaje]);
        }
        return nuevoMensaje;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || 'Error al enviar el mensaje');
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setEnviando(false);
        }
      }
    },
    [compraId, enviando]
  );

  return {
    mensajes,
    loading,
    refreshing,
    enviando,
    error,
    enviar,
    recargar: cargar,
  };
}
