// screens/LandlordListingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import { Property } from '../../types/Property';
import { fetchLandlordListings } from '../../services/PropertyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'LandlordListings'>;

export default function LandlordListingsScreen({ navigation }: Props) {
  const [listings, setListings] = useState<Property[]>([]);
  const [filteredListings, setFilteredListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    checkAuthAndLoadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedFilter]);

  const checkAuthAndLoadListings = async () => {
    try {
      const userData = await AsyncStorage.getItem('landlord_info');
      if (!userData) {
        console.log('❌ No landlord_info found in AsyncStorage');
        Alert.alert(
          'Authentication Required',
          'Please login to view your listings',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login')
            }
          ]
        );
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('✅ Loaded landlord info for listings:', user);
      await loadListings();
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      Alert.alert('Error', 'Failed to verify authentication');
    }
  };

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLandlordListings();
      setListings(data);
      console.log('✅ Loaded listings:', data.length);
    } catch (err: any) {
      console.error('❌ Error loading listings:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to load listings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const filterListings = () => {
    let filtered = listings;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.listingType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.propertyType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.state?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (selectedFilter) {
          case 'active':
            return item.availability === 'Available Now';
          case 'pending':
            return item.availability === 'Available Soon';
          case 'sold':
            return item.availability === 'Not Available';
          default:
            return true;
        }
      });
    }

    setFilteredListings(filtered);
  };

  const handleEditProperty = (property: Property) => {
    navigation.navigate('AddProperty', { listingId: property.id });
  };

  const handleViewProperty = (property: Property) => {
    navigation.navigate('PropertyDetails', { propertyId: property.id! });
  };

  const handleDeleteProperty = (property: Property) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.listingType}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteProperty(property.id!)
        }
      ]
    );
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      // TODO: Implement delete property API call
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Property deleted successfully',
      });
      await loadListings(); // Reload listings
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete property',
      });
    }
  };

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <View style={styles.propertyCard}>
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200' }} 
        style={styles.propertyImage}
        resizeMode="cover"
      />
      
      <View style={styles.propertyInfo}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyType}>{item.propertyType}</Text>
          <View style={[styles.statusBadge, 
            item.availability === 'Available Now' ? styles.activeBadge :
            item.availability === 'Available Soon' ? styles.pendingBadge :
            styles.soldBadge
          ]}>
            <Text style={styles.statusText}>
              {item.availability === 'Available Now' ? 'Active' :
               item.availability === 'Available Soon' ? 'Pending' : 'Sold'}
            </Text>
          </View>
        </View>

        <Text style={styles.listingType}>{item.listingType}</Text>
        <Text style={styles.price}>₦{item.price?.toLocaleString()}</Text>
        
        <View style={styles.propertyDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="bed" size={16} color="#666" />
            <Text style={styles.detailText}>{item.bedrooms} beds</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="water" size={16} color="#666" />
            <Text style={styles.detailText}>{item.bathrooms} baths</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="resize" size={16} color="#666" />
            <Text style={styles.detailText}>{item.areaValue} {item.areaUnit}</Text>
          </View>
        </View>

        <Text style={styles.address}>
          {item.address?.city}, {item.address?.state}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewProperty(item)}
          >
            <Ionicons name="eye" size={16} color="#007AFF" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProperty(item)}
          >
            <Ionicons name="create" size={16} color="#4CAF50" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProperty(item)}
          >
            <Ionicons name="trash" size={16} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Properties Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first property'
        }
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <TouchableOpacity 
          style={styles.addFirstButton}
          onPress={() => navigation.navigate('AddProperty', {})}
        >
          <Text style={styles.addFirstButtonText}>Add Your First Property</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProperty', {})}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your properties...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id!}
          renderItem={renderPropertyCard}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Properties</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterOptions}>
              {[
                { key: 'all', label: 'All Properties' },
                { key: 'active', label: 'Active Listings' },
                { key: 'pending', label: 'Pending' },
                { key: 'sold', label: 'Sold/Rented' }
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter.key && styles.selectedFilter
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter.key);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === filter.key && styles.selectedFilterText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding at the bottom for the filter modal
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  propertyInfo: {
    padding: 15,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  soldBadge: {
    backgroundColor: '#FBE9E7',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  listingType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  viewButton: {
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  viewButtonText: {
    color: '#007AFF',
    marginLeft: 5,
  },
  editButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  editButtonText: {
    color: '#4CAF50',
    marginLeft: 5,
  },
  deleteButton: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  deleteButtonText: {
    color: '#F44336',
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOptions: {
    marginTop: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
  },
});
