

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  async function handleRegister() {
    if (!email || !password || !fullName || !employeeId) {
      Alert.alert('Klaida', 'Prašome užpildyti visus laukus');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Klaida', 'Slaptažodis turi būti bent 6 simbolių ilgio');
      return;
    }

    setLoading(true);
    const result = await register(email, password, fullName, employeeId);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Sėkmingai', 'Paskyra sukurta! Dabar galite prisijungti.', [
        { text: 'Gerai', onPress: () => navigation.replace('Home') }
      ]);
    } else {
      Alert.alert('Registracijos klaida', result.error);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>👤</Text>
          <Text style={styles.title}>Sukurti Paskyrą</Text>
          <Text style={styles.subtitle}>Užpildykite duomenis registracijai</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vardas ir Pavardė</Text>
            <TextInput
              style={styles.input}
              placeholder="Jonas Jonaitis"
              placeholderTextColor="#64748b"
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Darbuotojo ID</Text>
            <TextInput
              style={styles.input}
              placeholder="EMP001"
              placeholderTextColor="#64748b"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="characters"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>El. paštas</Text>
            <TextInput
              style={styles.input}
              placeholder="jusu@pastas.lt"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Slaptažodis</Text>
            <TextInput
              style={styles.input}
              placeholder="Mažiausiai 6 simboliai"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Kuriama paskyra...' : 'Registruotis'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Grįžti į prisijungimą</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
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
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  button: {
    backgroundColor: '#ffd700',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
