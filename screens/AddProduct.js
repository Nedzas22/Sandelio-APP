
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function AddProductScreen({ navigation, route }) {
  const barcode = route.params?.barcode || '';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { addProduct } = useInventory();
  

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Klaida', 'Įveskite prekės pavadinimą');
      return;
    }

    const result = await addProduct({
      name: name.trim(),
      description: description.trim(),
      barcode: barcode,
    });

    if (result.success) {
      Alert.alert('Sėkmė', result.message, [
        { text: 'Gerai', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Klaida', result.error);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.barcodeBox}>
          <Text style={styles.barcodeLabel}>Nuskaitytas barkodas:</Text>
          <Text style={styles.barcodeValue}>{barcode}</Text>
        </View>

        <Text style={styles.label}>Pavadinimas *</Text>
        <TextInput
          style={styles.input}
          placeholder="Pvz. Samsung Galaxy S24"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Aprašymas (neprivaloma)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Trumpas prekės aprašymas..."
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Išsaugoti prekę</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Atšaukti</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  barcodeBox: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  barcodeLabel: {
    color: '#888',
    fontSize: 14,
  },
  barcodeValue: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
});
