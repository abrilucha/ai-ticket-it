import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthHandlers } from '../api/client.js';

const STORAGE_KEY = '@ai_ticket_it:user_id';

const AuthContext = createContext({
  usuario: null,
  isInitializing: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(async () => {
    // Limpiar handler síncronamente
    setAuthHandlers({
      getUserId: () => null,
      onUnauthorized: () => {},
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar error al borrar almacenamiento
    }
    setUsuario(null);
  }, []);

  // Sincronizar handlers del cliente HTTP cuando cambie usuario o logout
  useEffect(() => {
    setAuthHandlers({
      getUserId: () => usuario?.id || null,
      onUnauthorized: () => {
        logout();
      },
    });
  }, [usuario, logout]);

  // Validar sesión persistida al iniciar la app
  useEffect(() => {
    async function restaurarSesion() {
      try {
        const storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedId) {
          // Inyectamos temporalmente el ID para la consulta de validación
          setAuthHandlers({
            getUserId: () => storedId,
            onUnauthorized: () => logout(),
          });

          const perfil = await apiClient('/usuarios/me');
          if (perfil && perfil.id) {
            setAuthHandlers({
              getUserId: () => perfil.id,
              onUnauthorized: () => logout(),
            });
            setUsuario(perfil);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setUsuario(null);
          }
        }
      } catch (err) {
        // Si falló la validación o el usuario fue eliminado/no existe, volver al login
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
        } catch {}
        setUsuario(null);
      } finally {
        setIsInitializing(false);
      }
    }

    restaurarSesion();
  }, [logout]);

  const login = async (nuevoUsuario) => {
    if (!nuevoUsuario || !nuevoUsuario.id) return;
    // Sincronizar síncronamente antes de renderizar para que el primer fetch lleve x-user-id
    setAuthHandlers({
      getUserId: () => nuevoUsuario.id,
      onUnauthorized: () => logout(),
    });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nuevoUsuario.id);
    } catch {
      // Continuar en memoria aunque falle AsyncStorage
    }
    setUsuario(nuevoUsuario);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
