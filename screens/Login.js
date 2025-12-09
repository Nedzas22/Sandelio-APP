
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Klaida', 'Prašome užpildyti visus laukus');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Prisijungimo klaida', 'Neteisingas el. paštas arba slaptažodis');
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.logo}>📦</Text>
          <Text style={styles.title}>Sandėlio Sistema</Text>
          <Text style={styles.subtitle}>Prekių valdymas ir apskaita</Text>
        </View>
        
        <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Jungiamasi...' : 'Prisijungti'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>arba</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Sukurti naują paskyrą</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
