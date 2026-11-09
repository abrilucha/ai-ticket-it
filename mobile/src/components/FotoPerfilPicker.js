import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

export function FotoPerfilPicker({ fotoUri, onChangeFoto, style }) {
  const [zoomVisible, setZoomVisible] = useState(false);

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se requiere permiso para acceder a la cámara.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChangeFoto(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la cámara: ' + (err.message || 'Error desconocido'));
    }
  };

  const elegirDeGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se requiere permiso para acceder a la galería de fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChangeFoto(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo acceder a la galería: ' + (err.message || 'Error desconocido'));
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarWrapper}>
        <Pressable
          onPress={() => {
            if (fotoUri) setZoomVisible(true);
          }}
          disabled={!fotoUri}
          hitSlop={6}
        >
          <HardShadow offset={3} borderRadius={50} style={styles.avatarShadow}>
            <View style={styles.avatarCircle}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="person" size={44} color={Colors.inkBlack} />
                </View>
              )}
            </View>
          </HardShadow>
        </Pressable>

        {fotoUri ? (
          <Pressable
            onPress={() => onChangeFoto(null)}
            style={styles.deleteBadge}
            hitSlop={8}
          >
            <Text style={styles.deleteBadgeText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.hintText}>Foto de perfil (opcional)</Text>

      <View style={styles.actionsRow}>
        <HardShadow offset={2} borderRadius={6} style={styles.btnShadow}>
          <Pressable
            onPress={tomarFoto}
            style={styles.actionBtn}
          >
            <Ionicons name="camera" size={15} color={Colors.inkBlack} />
            <Text style={styles.actionBtnText}>CÁMARA</Text>
          </Pressable>
        </HardShadow>

        <HardShadow offset={2} borderRadius={6} style={styles.btnShadow}>
          <Pressable onPress={elegirDeGaleria} style={styles.actionBtn}>
            <Ionicons name="images" size={15} color={Colors.inkBlack} />
            <Text style={styles.actionBtnText}>GALERÍA</Text>
          </Pressable>
        </HardShadow>
      </View>

      {/* Modal para ampliar foto en formato redondo */}
      <Modal
        visible={zoomVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomVisible(false)}
      >
        <Pressable
          style={styles.zoomOverlay}
          onPress={() => setZoomVisible(false)}
        >
          <View style={styles.zoomContainer}>
            <HardShadow offset={6} borderRadius={130} style={styles.zoomShadow}>
              <View style={styles.zoomCircle}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={styles.zoomImage} />
                ) : null}
              </View>
            </HardShadow>

            <Pressable
              onPress={() => setZoomVisible(false)}
              style={styles.zoomCloseBtn}
              hitSlop={10}
            >
              <Text style={styles.zoomCloseText}>✕ CERRAR</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarShadow: {
    width: 88,
    height: 88,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    backgroundColor: '#FEF3C7', // Suave tono amarillo Pop
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.popVermilion,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteBadgeText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 14,
  },
  hintText: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginTop: 6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnShadow: {
    marginHorizontal: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  actionBtnText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '800',
    fontSize: 11,
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  zoomContainer: {
    alignItems: 'center',
  },
  zoomShadow: {
    width: 250,
    height: 250,
  },
  zoomCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    backgroundColor: '#FEF3C7',
    overflow: 'hidden',
  },
  zoomImage: {
    width: '100%',
    height: '100%',
  },
  zoomCloseBtn: {
    marginTop: 20,
    backgroundColor: Colors.popVermilion,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  zoomCloseText: {
    ...Typography.labelMd,
    color: Colors.white,
    fontWeight: '900',
  },
});
