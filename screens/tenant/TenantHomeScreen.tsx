import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, IconButton, Card, Avatar, FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'TenantHome'>;

const TenantHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [newestProperties, setNewestProperties] = useState<any[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const userJson = await AsyncStorage.getItem('agent_info');
        if (userJson) {
          const user = JSON.parse(userJson);
          setName(user.name || 'Tenant');
          setProfilePicture(user.profilePicture || user.avatar || '');
        }
      } catch (e) {
        setName('Tenant');
        setProfilePicture('');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('https://infinity-housing.onrender.com/property');
        const sorted = res.data
          .filter((p: any) => !!p.createdAt)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNewestProperties(sorted.slice(0, 5));
      } catch (e) {
        setNewestProperties([]);
      }
    })();
  }, []);

  const handleLogout = () => {
    // TODO: Implement logout logic (clear tokens, navigate to login, etc.)
    navigation.replace('Login');
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

  return (
    <View style={styles.container}>
      {/* Header with Profile and Logout */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar.Image 
            size={40} 
            source={profilePicture ? { uri: profilePicture } : require('../../assets/images/house1.jpg')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Hi, {name}</Text>
        </TouchableOpacity>

        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        />
      </View>
      {/* Newest Properties Section at the top */}
      {newestProperties.length > 0 && (
        <View style={styles.newestSection}>
          <Text style={styles.newestTitle}>Newest Properties</Text>
          <FlatList
            data={newestProperties}
            keyExtractor={item => item._id || item.id}
            renderItem={renderPropertyCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingLeft: 2, paddingRight: 2, alignItems: 'center' }}
            style={{ marginTop: 4, marginBottom: 0 }}
          />
        </View>
      )}
      <View style={styles.centerContent}>
        <Text style={[styles.subtitle, {fontSize: 12}]}>Browse, rent, or buy your dream home.</Text>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={() => navigation.navigate('Home')}
        >
          View Properties
        </Button>
        <Button
          mode="outlined"
          style={[styles.button, styles.lastButton]}
          labelStyle={{ color: '#007AFF', fontWeight: 'bold' }}
          onPress={() => navigation.navigate('SavedItems')}
        >
          View Saved Items
        </Button>
      </View>

      {/* Floating Action Button for Chatbot */}
      <FAB
        icon="chat-outline"
        label="Chat Assistant"
        style={[styles.fab, { backgroundColor: '#ffffffff' }]}
        onPress={() => navigation.navigate('Chatbot')}
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fdfdfdff',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    backgroundColor: '#e0e0e0',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    maxWidth: 120,
  },

  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#222',
    marginBottom: 2,
    width: '100%',
  },
  subtitle: {
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    alignSelf: 'center',
    width: 180,
    marginTop: 12,
    marginBottom: 0,
  },
  lastButton: {
    marginTop: 12,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 40,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    width: 160,
    minHeight: 200,
    maxWidth: 160,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  propertyImage: {
    width: 120,
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  propertyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  propertyPrice: {
    fontSize: 11,
    color: '#007AFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  propertyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 0,
    height: 22,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 2,
  },
  propertyButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    elevation: 1,
  },
  cardContent: {
    padding: 12,
  },
  cardImage: {
    height: 70,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
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
    marginBottom: 2,
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
  newestSection: {
    marginTop: 100,
    marginBottom: 4,
    alignItems: 'center',
    width: '100%',
  },
  newestTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
    width: '100%',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
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

export default TenantHomeScreen; 