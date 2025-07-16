import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedItems'>;

const SavedItemsScreen: React.FC<Props> = ({ navigation }) => {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const loadSavedProperties = async () => {
    try {
      const savedData = await AsyncStorage.getItem('saved_properties');
      if (savedData) {
        setSavedProperties(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedProperty = async (propertyId: string) => {
    try {
      const updatedProperties = savedProperties.filter(prop => prop._id !== propertyId);
      setSavedProperties(updatedProperties);
      await AsyncStorage.setItem('saved_properties', JSON.stringify(updatedProperties));
    } catch (error) {
      console.error('Error removing saved property:', error);
    }
  };

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

  const renderPropertyCard = ({ item }: { item: any }) => {
    const coverUrl = getCoverImage(item.images);
    return (
      <Card style={styles.card} elevation={2}>
        <View style={{ position: 'relative' }}>
          {item.images && item.images.length > 0 ? (
            <Card.Cover source={{ uri: coverUrl }} style={styles.cardImage} />
          ) : null}
          {/* Listing Type Tag on Image */}
          <View style={styles.listingTypeTagContainer}>
            <Text style={[styles.listingTypeTag, item.listingType === 'For Rent' ? styles.rentTag : styles.saleTag]}>
              {item.listingType}
            </Text>
          </View>
          {/* Remove Button */}
          <IconButton
            icon="close"
            size={20}
            style={styles.removeButton}
            onPress={() => removeSavedProperty(item._id)}
            iconColor="#fff"
          />
        </View>
        <Card.Content>
          <Text style={styles.title}>{item.title || item.propertyType}</Text>
          <Text style={styles.price}>{item.currency || 'NGN'} {item.price?.toLocaleString?.() || item.price}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={12} color="#666" style={styles.locationIcon} />
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
        </Card.Content>
        <Card.Actions>
          <Button 
            style={styles.cardButton} 
            compact 
            labelStyle={styles.cardButtonText} 
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: item._id || item.id })}
          >
            View Details
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Saved Items</Text>
      </View>

      {savedProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Saved Items</Text>
          <Text style={styles.emptySubtitle}>Properties you save will appear here</Text>
          <Button
            mode="contained"
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            Browse Properties
          </Button>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={item => item._id || item.id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardImage: {
    height: 200,
  },
  listingTypeTagContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  listingTypeTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    textTransform: 'uppercase',
  },
  rentTag: {
    backgroundColor: '#007AFF',
  },
  saleTag: {
    backgroundColor: '#34C759',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#222',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#444',
  },
  separator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 4,
  },
  furnishing: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  cardButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SavedItemsScreen; 