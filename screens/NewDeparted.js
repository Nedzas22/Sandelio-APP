import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function DepartedScreen() {
  const { departedProducts, loading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredProducts = departedProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBarcode}>🏷️ {item.barcode}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✓</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.productDescription}>{item.description}</Text>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📥</Text>
          <Text style={styles.sectionTitle}>Priėmimas</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {new Date(item.receivedAt).toLocaleDateString('lt-LT', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <Text style={styles.infoText}>
            {item.receivedBy.name} ({item.receivedBy.employeeId})
          </Text>
        </View>
      </View>

      <View style={[styles.section, styles.departedSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📤</Text>
          <Text style={[styles.sectionTitle, styles.departedTitle]}>Išsiuntimas</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {new Date(item.departedAt).toLocaleDateString('lt-LT', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <Text style={styles.infoText}>
            {item.departedBy.name} ({item.departedBy.employeeId})
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Išsiųstos prekės</Text>
        <Text style={styles.headerSubtitle}>
          Prekių, kurios išvyko iš sandėlio, istorija
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ieškoti išsiųstų prekių..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Viso: {filteredProducts.length} {filteredProducts.length === 1 ? 'prekė' : 'prekių'}
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>⏳ Kraunama...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Prekių nerasta' : 'Išsiųstų prekių nėra'}
          </Text>
          <Text style={styles.emptySubtext}>
            {!searchQuery && 'Prekės atsirai čia, kai jas išsiusite iš sandėlio'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#f59e0b"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 14,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  productBarcode: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#065f46',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#10b981',
  },
  productDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    marginBottom: 8,
  },
  departedSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  departedTitle: {
    color: '#f59e0b',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 24,
  },
  infoIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
});
