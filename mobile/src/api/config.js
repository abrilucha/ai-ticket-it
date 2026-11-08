/**
 * Configuración única y centralizada de la API de AI Ticket It.
 * Lee la variable de entorno de Expo EXPO_PUBLIC_API_URL o usa la IP por defecto de la red local.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.40:3000';
