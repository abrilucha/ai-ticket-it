import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthHandlers } from '../api/client.js';
import { iniciarSesion, registrar as registrarApi, cerrarSesion, obtenerYo } from '../api/auth.js';

const STORAGE_KEY = '@ai_ticket_it:auth_token';

const AuthContext = createContext({
  usuario: null,
  token: null,
  isInitializing: true,
  connectionError: null,
  login: async () => {},
  registrar: async () => {},
  logout: async () => {},
  reintentar: async () => {},
  actualizarUsuario: () => {},
  recargarUsuario: async () => {},
});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  const logout = useCallback(async () => {
    const currentToken = token;
    // Sincronizar handler de cliente para que no use más el token
    setAuthHandlers({
      getToken: () => null,
      onUnauthorized: () => {},
    });

    try {
      if (currentToken) {
        await cerrarSesion().catch(() => {});
      }
    } catch {
      // Ignorar error de red en logout
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar error de almacenamiento
    }

    setToken(null);
    setUsuario(null);
    setConnectionError(null);
  }, [token]);

  // Sincronizar handlers del cliente HTTP con el token actual
  useEffect(() => {
    setAuthHandlers({
      getToken: () => token,
      onUnauthorized: () => {
        logout();
      },
    });
  }, [token, logout]);

  // Validar sesión persistida al iniciar la app
  const restaurarSesion = useCallback(async () => {
    setIsInitializing(true);
    setConnectionError(null);
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
        setAuthHandlers({
          getToken: () => storedToken,
          onUnauthorized: () => logout(),
        });

        const perfil = await obtenerYo();
        if (perfil && perfil.id) {
          setUsuario(perfil);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUsuario(null);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        // Token vencido o inválido: limpiar sesión local
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
        } catch {}
        setToken(null);
        setUsuario(null);
      } else {
        // Error de conexión / red: NO borrar el token, mostrar aviso con reintentar
        setConnectionError(err.message || 'No se pudo conectar con el servidor.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [logout]);

  useEffect(() => {
    restaurarSesion();
  }, [restaurarSesion]);

  const login = async (email, password) => {
    const respuesta = await iniciarSesion(email, password);
    if (!respuesta || !respuesta.token) {
      throw new Error('Respuesta de inicio de sesión inválida');
    }

    const { token: nuevoToken, usuario: nuevoUsuario } = respuesta;
    setAuthHandlers({
      getToken: () => nuevoToken,
      onUnauthorized: () => logout(),
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, nuevoToken);
    } catch {
      // Continuar en memoria aunque falle AsyncStorage
    }

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    setConnectionError(null);
    return nuevoUsuario;
  };

  const registrar = async (datos) => {
    const respuesta = await registrarApi(datos);
    if (!respuesta || !respuesta.token) {
      throw new Error('Respuesta de registro inválida');
    }

    const { token: nuevoToken, usuario: nuevoUsuario } = respuesta;
    setAuthHandlers({
      getToken: () => nuevoToken,
      onUnauthorized: () => logout(),
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, nuevoToken);
    } catch {
      // Continuar en memoria
    }

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    setConnectionError(null);
    return nuevoUsuario;
  };

  const actualizarUsuario = useCallback((usuarioActualizado) => {
    setUsuario((prev) => ({ ...prev, ...usuarioActualizado }));
  }, []);

  const recargarUsuario = useCallback(async () => {
    try {
      const perfil = await obtenerYo();
      if (perfil && perfil.id) {
        setUsuario(perfil);
      }
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isInitializing,
        connectionError,
        login,
        registrar,
        logout,
        reintentar: restaurarSesion,
        actualizarUsuario,
        recargarUsuario,
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
