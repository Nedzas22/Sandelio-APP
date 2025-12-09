
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

export default function HomeScreen({ navigation }) {
  const { logout, userData } = useAuth();
  const { products, loading } = useInventory();
  
 
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

 
  async function handleLogout() {
    await logout();
    navigation.replace('Login');
  }

 
  function renderProduct({ item }) {
    return (
      <Animated.View style={[styles.productCard, { opacity: fadeAnim }]}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBarcode}>Barkodas: {item.barcode}</Text>
          {item.description && (
            <Text style={styles.productDesc}>{item.description}</Text>
          )}
          <Text style={styles.productEmployee}>
            Priėmė: {item.createdBy?.name || 'Nežinomas'}
          </Text>
        </View>
        <View style={styles.quantityBox}>
          <Text style={styles.quantityNumber}>{item.quantity}</Text>
          <Text style={styles.quantityLabel}>vnt.</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.welcome}>Sveiki, {userData?.fullName || 'Vartotojas'}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Atsijungti</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.actionButtonText}>📷 Skenuoti</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('Departed')}
        >
          <Text style={styles.actionButtonText}>📋 Išvykusios</Text>
        </TouchableOpacity>
      </View>


      <Text style={styles.sectionTitle}>Sandėlio prekės ({products.length})</Text>
      
      {loading ? (
        <Text style={styles.loadingText}>Kraunama...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>Sandėlis tuščias. Nuskaitykite barkodą, kad pridėtumėte prekių.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  welcome: {
    color: '#fff',
    fontSize: 16,
  },
  logoutText: {
    color: '#ffd700',
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffd700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffd700',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  listContent: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productBarcode: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  productDesc: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  productEmployee: {
    color: '#ffd700',
    fontSize: 12,
    marginTop: 5,
  },
  quantityBox: {
    backgroundColor: '#ffd700',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  quantityNumber: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityLabel: {
    color: '#000000',
    fontSize: 12,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
});
