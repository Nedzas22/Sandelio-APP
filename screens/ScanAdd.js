import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useInventory } from '../context/InventoryContext';

export default function ScanAddScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [productData, setProductData] = useState({
    name: '',
    description: ''
  });

  const { addProduct, findByBarcode } = useInventory();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    setBarcode(data);

    // Check if product exists
    const existing = await findByBarcode(data);
    
    if (existing) {
      Alert.alert(
        'Prekė rasta',
        `"${existing.name}" jau yra sandėlyje. Pridėti dar vieną vienetą?`,
        [
          { text: 'Atšaukti', style: 'cancel', onPress: () => setScanned(false) },
          { 
            text: 'Pridėti', 
            onPress: async () => {
              const result = await addProduct({ barcode: data });
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
    } else {
      setShowForm(true);
    }
  };

  const handleAddProduct = async () => {
    if (!productData.name.trim()) {
      Alert.alert('Klaida', 'Įveskite prekės pavadinimą');
      return;
    }

    const result = await addProduct({
      barcode,
      name: productData.name,
      description: productData.description
    });

    if (result.success) {
      Alert.alert('Sėkmingai', 'Nauja prekė pridėta į sandėlį!', [
        { 
          text: 'Gerai', 
          onPress: () => {
            setShowForm(false);
            setScanned(false);
            setProductData({ name: '', description: '' });
            navigation.goBack();
          }
        }
      ]);
    } else {
      Alert.alert('Klaida', result.error);
    }
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

  if (showForm) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formIcon}>📦</Text>
            <Text style={styles.formTitle}>Nauja prekė</Text>
            <Text style={styles.formSubtitle}>Užpildykite informaciją apie prekę</Text>
            <View style={styles.barcodeDisplay}>
              <Text style={styles.barcodeLabel}>Barkodas:</Text>
              <Text style={styles.barcodeValue}>{barcode}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prekės pavadinimas *</Text>
              <TextInput
                style={styles.input}
                placeholder="Pvz.: Nešiojamas kompiuteris"
                placeholderTextColor="#64748b"
                value={productData.name}
                onChangeText={(text) => setProductData({...productData, name: text})}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Aprašymas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Pvz.: Dell Latitude 5420, 16GB RAM, 512GB SSD"
                placeholderTextColor="#64748b"
                value={productData.description}
                onChangeText={(text) => setProductData({...productData, description: text})}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.submitButtonText}>✓ Pridėti prekę</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                setScanned(false);
                setProductData({ name: '', description: '' });
              }}
            >
              <Text style={styles.cancelButtonText}>Atšaukti</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
          <Text style={styles.instructionIcon}>📦</Text>
          <Text style={styles.instructionText}>
            Nukreipkite kamerą į barkodą
          </Text>
          <Text style={styles.instructionSubtext}>
            Barkodas bus nuskenuotas automatiškai
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
    borderColor: '#3b82f6',
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
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
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
  formContainer: {
    flexGrow: 1,
    padding: 24,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  formIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 20,
  },
  barcodeDisplay: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barcodeLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 12,
    padding: 16,
  },
  cancelButtonText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
