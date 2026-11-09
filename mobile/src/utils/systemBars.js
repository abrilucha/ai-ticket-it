import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

// Mantener la barra visible y fija cuando la app vuelve de segundo plano
if (Platform.OS === 'android') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      setAndroidBottomBar();
    }
  });
}

/**
 * Configura la barra de navegación inferior del sistema en Android.
 * Mantiene la barra física con los 3 botones siempre visible y fija,
 * con iconos oscuros ('dark') para contrastar sobre la barra nativa clara.
 */
export async function setAndroidBottomBar() {
  if (Platform.OS !== 'android') return;
  try {
    // Restaurar la barra del sistema visible y fija (comportamiento normal sin ocultar/swipe)
    if (typeof NavigationBar.setBehaviorAsync === 'function') {
      await NavigationBar.setBehaviorAsync('default');
    }

    if (typeof NavigationBar.setVisibilityAsync === 'function') {
      await NavigationBar.setVisibilityAsync('visible');
    }

    // Estilo de botones oscuros sobre fondo claro
    if (typeof NavigationBar.setStyle === 'function') {
      NavigationBar.setStyle('dark');
    }

    if (typeof NavigationBar.setBackgroundColorAsync === 'function') {
      await NavigationBar.setBackgroundColorAsync('#FFFFFF');
    }
  } catch (err) {
    // Si no está disponible en este entorno, ignorar sin romper
  }
}
