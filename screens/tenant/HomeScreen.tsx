// screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Dialog, Portal, TextInput, Checkbox, HelperText, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import axios from 'axios';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { Ionicons } from '@expo/vector-icons';

// Remove mockProperties

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const groupByPropertyType = (properties: any[]) => {
  return properties.reduce((acc, property) => {
    const type = property.propertyType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(property);
    return acc;
  }, {} as Record<string, any[]>);
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF', // Blue for button focus/active
  },
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAllType, setViewAllType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Filter modal state
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState({
    minPrice: '',
    maxPrice: '',
    listingType: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('https://infinity-housing.onrender.com/property');
        setProperties(response.data);
      } catch (err: any) {
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      } catch (e) {
        setLocationError('Could not get location');
      }
    })();
  }, []);

  // Calculate distance for each property
  const propertiesWithDistance = userLocation
    ? properties.map(property => {
        const coords = property.address?.coordinates?.coordinates;
        if (!coords || coords.length !== 2) return { ...property, distance: null };
        const propCoords = { latitude: coords[1], longitude: coords[0] };
        const distance = getDistance(userLocation, propCoords); // in meters
        return { ...property, distance };
      })
    : properties.map(property => ({ ...property, distance: null }));

  // Get 10 closest properties
  const nearYouProperties = propertiesWithDistance
    .filter(p => typeof p.distance === 'number')
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, 10);

  const makeAbsoluteUrl = (url: string) =>
    url && url.startsWith('http')
      ? url
      : url
      ? `https://infinity-housing.onrender.com${url.startsWith('/') ? url : '/' + url}`
      : '';

  const getCoverImage = (images: any[]) => {
  if (!Array.isArray(images)) return '';

  const first = images[0];

  if (typeof first === 'string') {
    return makeAbsoluteUrl(first);
  }

  if (first?.url) {
    return makeAbsoluteUrl(first.url);
  }

  return '';
};


  const renderProperty = ({ item }: { item: any }) => {
    const coverUrl = getCoverImage(item.images);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item._id || item.id })}
        onLongPress={() => {
          setSelectedProperty(item);
          setPreviewModalVisible(true);
        }}
        onPressOut={() => {
          if (previewModalVisible) {
            setPreviewModalVisible(false);
            setSelectedProperty(null);
          }
        }}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={{ position: 'relative' }}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: coverUrl }} style={styles.cardImage} />
          ) : null}
          {/* Listing Type Tag on Image */}
          <View style={styles.listingTypeTagContainer}>
            <Text style={[styles.listingTypeTag, item.listingType === 'For Rent' ? styles.rentTag : styles.saleTag]}>
              {item.listingType}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title || item.propertyType}</Text>
          <Text style={styles.price}>{item.currency || 'NGN'} {item.price?.toLocaleString?.() || item.price}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={10} color="#666" style={styles.locationIcon} />
            <Text style={styles.address}>{item.address?.street || item.address || item.location || ''}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detail}>{item.bedrooms} Bed</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.detail}>{item.bathrooms} Bath</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.detail}>{item.area?.value || item.area} {item.area?.unit || item.areaUnit || ''}</Text>
          </View>
          <Text style={styles.furnishing}>{item.furnishing}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Filtering logic
  const filteredProperties = properties.filter((item) => {
    const { minPrice, maxPrice, listingType, city, state, bedrooms, bathrooms, propertyType } = filter;
    let pass = true;
    if (minPrice && Number(item.price) < Number(minPrice)) pass = false;
    if (maxPrice && Number(item.price) > Number(maxPrice)) pass = false;
    if (listingType && item.listingType !== listingType) pass = false;
    if (city && item.address?.city?.toLowerCase() !== city.toLowerCase()) pass = false;
    if (state && item.address?.state?.toLowerCase() !== state.toLowerCase()) pass = false;
    if (bedrooms && Number(item.bedrooms) !== Number(bedrooms)) pass = false;
    if (bathrooms && Number(item.bathrooms) !== Number(bathrooms)) pass = false;
    if (propertyType && item.propertyType !== propertyType) pass = false;
    return pass;
  });

  // Group filtered properties by type
  const grouped = groupByPropertyType(filteredProperties);
  const propertyTypes = Object.keys(grouped);

  if (loading) {
    return (
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
        <Button mode="contained" onPress={() => {
          setLoading(true);
          setError(null);
          // Retry fetch
          axios.get('https://infinity-housing.onrender.com/property')
            .then(res => setProperties(res.data))
            .catch(() => setError('Failed to load properties. Please try again.'))
            .finally(() => setLoading(false));
        }}>Retry</Button>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Properties</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Filter Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor:'#fffff', marginBottom: 12 }}>
          <Button mode="outlined" icon="filter-variant" onPress={() => setFilterVisible(true)}>
            Filters
          </Button>
        </View>
        {/* Near You Section */}
        {userLocation && nearYouProperties.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={styles.sectionHeader}>Recommended Near You</Text>
            <FlatList
              data={nearYouProperties}
              keyExtractor={item => item._id || item.id}
              renderItem={renderProperty}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingLeft: 2, paddingRight: 12 }}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
        {/* Filter Modal */}
        <Portal>
          <Dialog visible={filterVisible} onDismiss={() => setFilterVisible(false)} style={{ backgroundColor: '#fff' }}>
            <Dialog.Title>Filter Properties</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Min Price"
                value={filter.minPrice}
                onChangeText={v => setFilter(f => ({ ...f, minPrice: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <TextInput
                label="Max Price"
                value={filter.maxPrice}
                onChangeText={v => setFilter(f => ({ ...f, maxPrice: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Listing Type</Text>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                {['For Sale', 'For Rent'].map(type => (
                  <Button
                    key={type}
                    mode={filter.listingType === type ? 'contained' : 'outlined'}
                    onPress={() => setFilter(f => ({ ...f, listingType: f.listingType === type ? '' : type }))}
                    style={{ marginRight: 8 }}
                  >
                    {type}
                  </Button>
                ))}
              </View>
              <TextInput
                label="City"
                value={filter.city}
                onChangeText={v => setFilter(f => ({ ...f, city: v }))}
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <TextInput
                label="State"
                value={filter.state}
                onChangeText={v => setFilter(f => ({ ...f, state: v }))}
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <TextInput
                label="Bedrooms"
                value={filter.bedrooms}
                onChangeText={v => setFilter(f => ({ ...f, bedrooms: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <TextInput
                label="Bathrooms"
                value={filter.bathrooms}
                onChangeText={v => setFilter(f => ({ ...f, bathrooms: v.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
              />
              <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Property Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['Duplex', 'Bungalow', 'Flat', 'Self-Contain', 'Terraced', 'Mansion'].map(type => (
                  <Button
                    key={type}
                    mode={filter.propertyType === type ? 'contained' : 'outlined'}
                    onPress={() => setFilter(f => ({ ...f, propertyType: f.propertyType === type ? '' : type }))}
                    style={{ marginRight: 8, marginBottom: 6 }}
                  >
                    {type}
                  </Button>
                ))}
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => { setFilter({ minPrice: '', maxPrice: '', listingType: '', city: '', state: '', bedrooms: '', bathrooms: '', propertyType: '' }); }}>Clear</Button>
              <Button onPress={() => setFilterVisible(false)}>Apply</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* Grouped Carousels */}
        {propertyTypes.map((type) => {
          const allProps = grouped[type];
          const showAll = viewAllType === type;
          const data = showAll ? allProps : allProps.slice(0, 10);
          return (
            <View key={type} style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 8 }}>
                <Text style={styles.sectionHeader}>{type}</Text>
                {allProps.length > 10 && (
                  <Button
                    mode="text"
                    compact
                    onPress={() => setViewAllType(showAll ? null : type)}
                    style={{ marginRight: 0 }}
                  >
                    {showAll ? 'Show Less' : 'View All'}
                  </Button>
                )}
              </View>
              <FlatList
                data={data}
                keyExtractor={item => item._id || item.id}
                renderItem={renderProperty}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingLeft: 2, paddingRight: 12 }}
                style={{ marginTop: 8 }}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Property Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewModal}>
            {selectedProperty && (
              <>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Quick Preview</Text>
                  <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.previewImageContainer}>
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <Image 
                      source={{ uri: getCoverImage(selectedProperty.images) }} 
                      style={styles.previewImage} 
                    />
                  ) : (
                    <View style={[styles.previewImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text>No Image</Text>
                    </View>
                  )}
                  <View style={styles.previewListingTag}>
                    <Text style={[styles.previewListingTagText, selectedProperty.listingType === 'For Rent' ? styles.rentTag : styles.saleTag]}>
                      {selectedProperty.listingType}
                    </Text>
                  </View>
                </View>

                <View style={styles.previewContent}>
                  <Text style={styles.previewPropertyTitle}>{selectedProperty.title || selectedProperty.propertyType}</Text>
                  <Text style={styles.previewPrice}>{selectedProperty.currency || 'NGN'} {selectedProperty.price?.toLocaleString?.() || selectedProperty.price}</Text>
                  
                  <View style={styles.previewAddressContainer}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    <Text style={styles.previewAddress}>{selectedProperty.address?.street || selectedProperty.address || selectedProperty.location || ''}</Text>
                  </View>

                  <View style={styles.previewDetailsRow}>
                    <Text style={styles.previewDetail}>{selectedProperty.bedrooms} Bed</Text>
                    <Text style={styles.previewSeparator}>•</Text>
                    <Text style={styles.previewDetail}>{selectedProperty.bathrooms} Bath</Text>
                    <Text style={styles.previewSeparator}>•</Text>
                    <Text style={styles.previewDetail}>{selectedProperty.area?.value || selectedProperty.area} {selectedProperty.area?.unit || selectedProperty.areaUnit || ''}</Text>
                  </View>

                  {selectedProperty.description && (
                    <Text style={styles.previewDescription} numberOfLines={3}>
                      {selectedProperty.description}
                    </Text>
                  )}

                  <View style={styles.previewActions}>
                    <Button
                      mode="contained"
                      style={styles.previewViewButton}
                      onPress={() => {
                        setPreviewModalVisible(false);
                        navigation.navigate('PropertyDetails', { propertyId: selectedProperty._id || selectedProperty.id });
                      }}
                    >
                      View Full Details
                    </Button>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafaff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    width: 160,
    minHeight: 200,
    maxWidth: 160,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardImage: {
    height: 70,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#222',
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    marginVertical: 2,
  },
  address: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  detail: {
    fontSize: 10,
    color: '#444',
    marginRight: 6,
  },
  separator: {
    fontSize: 10,
    color: '#ccc',
    marginHorizontal: 2,
  },
  furnishing: {
    fontSize: 10,
    color: '#888',
    marginBottom: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#282e34ff',
    marginBottom: 2,
    marginLeft: 2,
    marginTop: 8,
  },

  listingTypeTagContainer: {
    position: 'absolute',
    top: 2,
    left: 0,
    zIndex: 2,
  },
  listingTypeTag: {
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 0,
    overflow: 'hidden',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rentTag: {
    backgroundColor: '#007AFF',
  },
  saleTag: {
    backgroundColor: '#34C759',
  },
  // Preview Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  previewImageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewListingTag: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  previewListingTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    textTransform: 'uppercase',
  },
  previewContent: {
    padding: 16,
  },
  previewPropertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  previewAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  previewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewDetail: {
    fontSize: 13,
    color: '#444',
  },
  previewSeparator: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewActions: {
    alignItems: 'center',
  },
  previewViewButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
});

export default HomeScreen;
