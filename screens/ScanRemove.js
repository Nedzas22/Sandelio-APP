import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useInventory } from '../context/InventoryContext';

export default function ScanRemoveScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const { removeProduct, findByBarcode } = useInventory();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);

    const product = await findByBarcode(data);
    
    if (!product) {
      Alert.alert(
        'Prekė nerasta',
        'Ši prekė neegzistuoja sandėlyje',
        [
          { text: 'Gerai', onPress: () => setScanned(false) }
        ]
      );
      return;
    }

    Alert.alert(
      'Išsiųsti prekę',
      `Prekė: "${product.name}"\nKiekis sandėlyje: ${product.quantity} vnt\n\nPrekė bus perkelta į išsiųstų prekių sąrašą.`,
      [
        { text: 'Atšaukti', style: 'cancel', onPress: () => setScanned(false) },
        { 
          text: 'Išsiųsti', 
          style: 'destructive',
          onPress: async () => {
            const result = await removeProduct(data);
            if (result.success) {
              Alert.alert('Sėkmingai', result.message, [
                { text: 'Gerai', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Klaida', result.error);
              setScanned(false);
            }
          }
        }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Prašoma kameros leidimo...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>📷</Text>
        <Text style={styles.errorText}>Nėra prieigos prie kameros</Text>
        <Text style={styles.errorSubtext}>
          Leiskite naudoti kamerą programos nustatymuose
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Grįžti atgal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upce'],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionIcon}>📤</Text>
          <Text style={styles.instructionText}>
            Nuskenuokite prekę išsiuntimui
          </Text>
          <Text style={styles.instructionSubtext}>
            Prekė bus perkelta į išsiųstų sąrašą
          </Text>
        </View>

        {scanned && (
          <View style={styles.scannedOverlay}>
            <Text style={styles.scannedText}>Skenuojama...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.bottomButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.bottomButtonText}>← Grįžti</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#8b5cf6',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: 24,
  },
  instructionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bottomButton: {
    backgroundColor: '#1e293b',
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  bottomButtonText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  messageText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  errorIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
