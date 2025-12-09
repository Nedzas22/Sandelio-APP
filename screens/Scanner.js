

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useInventory } from '../context/InventoryContext';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('add');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  
  const modeRef = useRef(mode);
  modeRef.current = mode;
  
  const { addProduct, removeProduct, findByBarcode } = useInventory();
  

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Tikrinama...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Reikia kameros leidimo</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Suteikti leidimą</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleAddNewProduct() {
    if (!productName.trim()) {
      Alert.alert('Klaida', 'Įveskite prekės pavadinimą');
      return;
    }

    const result = await addProduct({
      barcode: scannedBarcode,
      name: productName,
      description: productDescription
    });

    setShowForm(false);
    setProductName('');
    setProductDescription('');
    
    if (result.success) {
      setMessage(`✅ Prekė "${productName}" pridėta!`);
    } else {
      setMessage(`❌ Klaida: ${result.error}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleBarCodeScanned({ data }) {
    const currentMode = modeRef.current;
    
    if (currentMode === 'add') {
      const existing = await findByBarcode(data);
      
      if (existing) {
        await addProduct({ barcode: data });
        setMessage(`✅ "${existing.name}" kiekis padidintas! (${existing.quantity + 1} vnt.)`);
      } else {
        // Show form for new product
        setScannedBarcode(data);
        setShowForm(true);
      }
    } else {
      const result = await removeProduct(data);
      if (result.success) {
        setMessage(`🗑️ ${result.message}`);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    }
    
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
        }}
        onBarcodeScanned={showForm ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={[
          styles.modeIndicator, 
          mode === 'add' ? styles.modeIndicatorAdd : styles.modeIndicatorRemove
        ]}>
          <Text style={styles.modeIndicatorText}>
            {mode === 'add' ? '➕ PRIDĖJIMO REŽIMAS' : '➖ ŠALINIMO REŽIMAS'}
          </Text>
        </View>

        <View style={[
          styles.scanBox,
          mode === 'remove' && styles.scanBoxRemove
        ]}>
          <Animated.View 
            style={[
              styles.scanLine,
              mode === 'remove' && styles.scanLineRemove,
              {
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  })
                }]
              }
            ]} 
          />
        </View>
        
        {message !== '' && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>

      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'add' && styles.modeActive]}
          onPress={() => setMode('add')}
        >
          <Text style={styles.modeText}>➕ Pridėti</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, mode === 'remove' && styles.modeActiveRemove]}
          onPress={() => setMode('remove')}
        >
          <Text style={styles.modeText}>➖ Pašalinti</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {mode === 'add' 
          ? 'Nuskaitykite kodą, kad pridėtumėte prekę' 
          : 'Nuskaitykite kodą, kad pašalintumėte prekę'}
      </Text>

      {/* Add Product Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nauja prekė</Text>
            <Text style={styles.modalBarcode}>Barkodas: {scannedBarcode}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Prekės pavadinimas *"
              placeholderTextColor="#888"
              value={productName}
              onChangeText={setProductName}
              autoFocus
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Aprašymas (neprivaloma)"
              placeholderTextColor="#888"
              value={productDescription}
              onChangeText={setProductDescription}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddNewProduct}
            >
              <Text style={styles.submitButtonText}>Pridėti prekę</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                setProductName('');
                setProductDescription('');
              }}
            >
              <Text style={styles.cancelButtonText}>Atšaukti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeIndicatorAdd: {
    backgroundColor: '#ffd700',
  },
  modeIndicatorRemove: {
    backgroundColor: '#ffd700',
  },
  modeIndicatorText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#ffd700',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanBoxRemove: {
    borderColor: '#ffd700',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#ffd700',
  },
  scanLineRemove: {
    backgroundColor: '#ffd700',
  },
  messageBox: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modeActive: {
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  modeActiveRemove: {
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  modeText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: '#888',
    textAlign: 'center',
    paddingBottom: 20,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#e94560',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalBarcode: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#000000',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ffd700',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
});