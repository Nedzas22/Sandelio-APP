import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

export default function WarehouseScreen({ navigation }) {
  const { user, userData, logout } = useAuth();
  const { products, loading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  async function handleLogout() {
    Alert.alert(
      'Atsijungti',
      'Ar tikrai norite atsijungti?',
      [
        { text: 'Atšaukti', style: 'cancel' },
        { 
          text: 'Atsijungti', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBarcode}>🏷️ {item.barcode}</Text>
        </View>
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Text style={styles.quantityLabel}>vnt</Text>
        </View>
      </View>
      
      <Text style={styles.productDescription}>{item.description}</Text>
      
      <View style={styles.productFooter}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {new Date(item.createdAt).toLocaleDateString('lt-LT', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <Text style={styles.infoText}>
            {item.createdBy.name} ({item.createdBy.employeeId})
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Sveiki 👋</Text>
          <Text style={styles.userName}>{userData?.fullName || 'Vartotojau'}</Text>
          <Text style={styles.employeeId}>Darbuotojas: {userData?.employeeId || 'N/A'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Prekių tipų</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSecondary]}>
          <Text style={styles.statNumber}>{totalQuantity}</Text>
          <Text style={styles.statLabel}>Viso vienetų</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.scanButton]}
          onPress={() => navigation.navigate('ScanAdd')}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>Pridėti prekę</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => navigation.navigate('ScanRemove')}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Išsiųsti prekę</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.departedButton]}
          onPress={() => navigation.navigate('Departed')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Išsiųstos</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ieškoti prekių..."
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

      {/* Products List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Sandėlio prekės {filteredProducts.length > 0 && `(${filteredProducts.length})`}
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>⏳ Kraunama...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Prekių nerasta' : 'Sandėlyje prekių nėra'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('ScanAdd')}
            >
              <Text style={styles.emptyButtonText}>+ Pridėti pirmą prekę</Text>
            </TouchableOpacity>
          )}
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
              tintColor="#3b82f6"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  logoutIcon: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: '#1e3a8a',
  },
  statCardSecondary: {
    backgroundColor: '#065f46',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 4,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#3b82f6',
  },
  removeButton: {
    backgroundColor: '#8b5cf6',
  },
  departedButton: {
    backgroundColor: '#f59e0b',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 16,
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
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
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
  quantityBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  quantityLabel: {
    fontSize: 11,
    color: '#6ee7b7',
    marginTop: 2,
  },
  productDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
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
    color: '#64748b',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
