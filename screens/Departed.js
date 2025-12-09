
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated
} from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function DepartedScreen() {
  const { departedProducts } = useInventory();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

 
  function formatDate(dateString) {
    if (!dateString) return 'Nežinoma';
    const date = new Date(dateString);
    return date.toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  function renderItem({ item }) {
    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.barcode}>Barkodas: {item.barcode}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>📤 Išvyko:</Text>
          <Text style={styles.value}>{formatDate(item.departedAt)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>👤 Išdavė:</Text>
          <Text style={styles.value}>{item.departedBy?.name || 'Nežinomas'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>📥 Priimta:</Text>
          <Text style={styles.valueSmall}>{formatDate(item.receivedAt)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>👤 Priėmė:</Text>
          <Text style={styles.valueSmall}>{item.receivedBy?.name || 'Nežinomas'}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Išvykusios prekės ({departedProducts.length})</Text>
      
      {departedProducts.length === 0 ? (
        <Text style={styles.emptyText}>Kol kas nėra išvykusių prekių</Text>
      ) : (
        <FlatList
          data={departedProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
  },
  list: {
    padding: 15,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  barcode: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  label: {
    color: '#888',
    width: 80,
  },
  value: {
    color: '#e94560',
    flex: 1,
  },
  valueSmall: {
    color: '#aaa',
    flex: 1,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4e',
    marginVertical: 10,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
