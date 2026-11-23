import { useState, useRef, useCallback, useEffect } from 'react';
import { listarFavoritos, agregarFavorito, quitarFavorito } from '../api/favoritos.js';
import { useFeedback } from '../context/FeedbackContext.js';

/**
 * Hook para listar los favoritos del comprador con protección contra respuestas viejas.
 */
export function useFavoritos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchFavoritos = useCallback(async () => {
    const currentRequestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listarFavoritos();
      if (currentRequestId === latestRequestId.current) {
        setData(Array.isArray(result) ? result : []);
        setLoading(false);
      }
    } catch (err) {
      if (currentRequestId === latestRequestId.current) {
        setError(err.message || 'Error al cargar tus eventos favoritos');
        setLoading(false);
      }
    }
  }, []);

  return {
    data,
    loading,
    error,
    reload: fetchFavoritos,
    setData,
  };
}

/**
 * Hook para alternar el estado de favorito de un evento.
 * Bloquea el botón mientras hay una petición en curso (evita duplicados por doble toque),
 * actualiza el estado y en caso de error revierte al estado anterior y expone error.message.
 */
export function useToggleFavorito(eventoId, esFavoritoInicial = false, onToggleSuccess = null) {
  const { showSuccess } = useFeedback();
  const [esFavorito, setEsFavorito] = useState(Boolean(esFavoritoInicial));
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEsFavorito(Boolean(esFavoritoInicial));
  }, [esFavoritoInicial]);

  const alternar = useCallback(async () => {
    if (procesando || !eventoId) return;
    setProcesando(true);
    setError(null);
    const estadoPrevio = esFavorito;

    try {
      if (estadoPrevio) {
        await quitarFavorito(eventoId);
        setEsFavorito(false);
        showSuccess('Quitado de favoritos');
        if (onToggleSuccess) onToggleSuccess(false, eventoId);
      } else {
        await agregarFavorito(eventoId);
        setEsFavorito(true);
        showSuccess('¡Agregado a favoritos!');
        if (onToggleSuccess) onToggleSuccess(true, eventoId);
      }
    } catch (err) {
      setEsFavorito(estadoPrevio);
      setError(err.message || 'Error al actualizar favoritos');
    } finally {
      setProcesando(false);
    }
  }, [procesando, eventoId, esFavorito, onToggleSuccess, showSuccess]);

  return {
    esFavorito,
    procesando,
    alternar,
    error,
  };
}
