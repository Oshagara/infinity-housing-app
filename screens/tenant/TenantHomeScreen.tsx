import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  ActivityIndicator, 
  Animated, 
  FlatList, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Text, Button, IconButton, Card, Avatar, FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'TenantHome'>;

const TenantHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [newestProperties, setNewestProperties] = useState<any[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRollingLoader, setShowRollingLoader] = useState(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRollingLoader();
    loadUserData();
    loadProperties();
    loadSavedProperties();
    
    // Add overall timeout to prevent infinite loading
    const overallTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        Toast.show({
          type: 'info',
          text1: 'Loading timeout',
          text2: 'Some data may not be fully loaded',
        });
      }
    }, 15000); // 15 seconds timeout
    
    return () => clearTimeout(overallTimeout);
  }, []);

  const loadSavedProperties = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_properties');
      if (saved) {
        const savedIds = JSON.parse(saved);
        setSavedProperties(savedIds);
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    }
  };

  const toggleSaveProperty = async (propertyId: string) => {
    try {
      const newSavedProperties = savedProperties.includes(propertyId)
        ? savedProperties.filter(id => id !== propertyId)
        : [...savedProperties, propertyId];
      
      setSavedProperties(newSavedProperties);
      await AsyncStorage.setItem('saved_properties', JSON.stringify(newSavedProperties));
      
      Toast.show({
        type: 'success',
        text1: savedProperties.includes(propertyId) ? 'Removed from saved' : 'Saved to favorites',
        text2: savedProperties.includes(propertyId) ? 'Property removed from your saved items' : 'Property added to your saved items',
      });
    } catch (error) {
      console.error('Error saving property:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save property',
      });
    }
  };

  const startRollingLoader = () => {
    // Start rolling animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000, // Reduced from 2000
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 500, // Reduced from 1000
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 500, // Reduced from 1000
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Hide rolling loader after 1.5 seconds (reduced from 2 seconds)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300, // Reduced from 500
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300, // Reduced from 500
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowRollingLoader(false);
      });
    }, 1000); // Reduced from 2000
  };

  const checkOverallLoading = () => {
    // Reduce overall loading time by showing content faster
    if (!isLoadingUser && !isLoadingProperties) {
      // Show content immediately if both are done
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoadingUser(true);
      console.log('🔍 Loading user data...');
      
      let userData = null;
      let userName = 'Tenant';
      let userProfilePicture = '';
      
      // Try to get user data from multiple sources
      const role = await AsyncStorage.getItem('role');
      console.log('🔍 User role:', role);
      
      // Try role-specific data first
      if (role === 'tenant') {
        const tenantJson = await AsyncStorage.getItem('tenant_info');
        if (tenantJson) {
          userData = JSON.parse(tenantJson);
          console.log('🔍 Found tenant_info data');
        }
      } else if (role === 'landlord') {
        const landlordJson = await AsyncStorage.getItem('landlord_info');
        if (landlordJson) {
          userData = JSON.parse(landlordJson);
          console.log('🔍 Found landlord_info data');
        }
      }
      
      // Fallback to user_info
      if (!userData) {
        const userInfoJson = await AsyncStorage.getItem('user_info');
        if (userInfoJson) {
          userData = JSON.parse(userInfoJson);
          console.log('🔍 Found user_info data');
        }
      }
      
      // Fallback to individual fields
      if (!userData) {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        const userId = await AsyncStorage.getItem('user_id');
        
        if (name || email || userId) {
          userData = {
            name: name || 'User',
            email: email || '',
            id: userId || '',
          };
          console.log('🔍 Created user data from individual fields');
        }
      }
      
      // Set user data
      if (userData) {
        userName = userData.name || userData.fullName || userData.email || 'User';
        userProfilePicture = userData.profilePicture || userData.avatar || '';
        console.log('✅ User data loaded successfully:', userName);
      } else {
        console.log('⚠️ No user data found, using defaults');
      }
      
      setName(userName);
      setProfilePicture(userProfilePicture);
      
      } catch (e) {
      console.error('❌ Error loading user data:', e);
        setName('Tenant');
        setProfilePicture('');
    } finally {
      setIsLoadingUser(false);
      checkOverallLoading();
    }
  };

  const loadProperties = async () => {
    try {
      setIsLoadingProperties(true);
      setHasError(false);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000) // Reduced from 10000
      );
      
      const fetchPromise = axios.get('https://infinity-housing.onrender.com/property');
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      const sorted = (response as any).data
          .filter((p: any) => !!p.createdAt)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNewestProperties(sorted.slice(0, 5));
      } catch (e) {
      console.error('Error loading properties:', e);
        setNewestProperties([]);
      setHasError(true);
      Toast.show({
        type: 'error',
        text1: 'Failed to load properties',
        text2: 'Please check your internet connection and try again',
      });
    } finally {
      setIsLoadingProperties(false);
      checkOverallLoading();
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out and clearing all data...');
      
      // Clear all authentication and user data
      const keysToRemove = [
        'user_info',
        'user',
        'access_token',
        'role',
        'email',
        'name',
        'user_id',
        'phone',
        'user_email',
        'landlord_info',
        'tenant_info',
        'saved_properties', // Also clear saved properties
      ];

      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
      }

      console.log('✅ All data cleared successfully');
      
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully',
        // text2: 'All data has been cleared',
    });
      
    navigation.replace('Login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: 'Please try again',
      });
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
    const isSaved = savedProperties.includes(item._id || item.id);
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
          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleSaveProperty(item._id || item.id);
            }}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={20} 
              color={isSaved ? "#ff4757" : "#fff"} 
            />
          </TouchableOpacity>
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

  const renderLoadingCard = () => (
    <View style={[styles.card, styles.loadingCard]}>
      <View style={styles.loadingImage} />
      <View style={styles.cardContent}>
        <View style={styles.loadingTitle} />
        <View style={styles.loadingPrice} />
        <View style={styles.loadingAddress} />
        <View style={styles.loadingDetails} />
      </View>
    </View>
  );

  // Show rolling loader
  if (showRollingLoader) {
    return (
      <View style={styles.rollingLoaderContainer}>
        <Animated.View
          style={[
            styles.rollingLoaderContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: logoScale },
                {
                  rotate: logoRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={80} color="#007AFF" />
          </View>
          <Text style={styles.rollingLoaderTitle}>Infinity Housing</Text>
          <Text style={styles.rollingLoaderSubtitle}>Loading your dream home...</Text>
          
          <View style={styles.loadingDotsContainer}>
            <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Profile and Logout */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => navigation.navigate('Profile')}
        >
          {isLoadingUser ? (
            <View style={styles.loadingProfile}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
          <Avatar.Image 
            size={40} 
            source={profilePicture ? { uri: profilePicture } : require('../../assets/images/house1.jpg')}
            style={styles.profileImage}
          />
          )}
          <Text style={styles.profileName}>
            {isLoadingUser ? 'Loading...' : `Hi, ${name}`}
          </Text>
        </TouchableOpacity>

        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        />
      </View>

      {/* Newest Properties Section */}
        <View style={styles.newestSection}>
          <Text style={styles.newestTitle}>Newest Properties</Text>
        
        {isLoadingProperties ? (
          <View style={styles.loadingPropertiesContainer}>
            <FlatList
              data={[1, 2, 3]} // Show 3 loading cards
              keyExtractor={(item) => item.toString()}
              renderItem={() => renderLoadingCard()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingLeft: 2, paddingRight: 2, alignItems: 'center' }}
              style={{ marginTop: 4, marginBottom: 0 }}
            />
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="wifi-outline" size={48} color="#ccc" />
            <Text style={styles.errorText}>Failed to load properties</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProperties}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : newestProperties.length > 0 ? (
          <FlatList
            data={newestProperties}
            keyExtractor={item => item._id || item.id}
            renderItem={renderPropertyCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingLeft: 2, paddingRight: 2, alignItems: 'center' }}
            style={{ marginTop: 4, marginBottom: 0 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No properties available</Text>
        </View>
      )}
      </View>

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
        icon="chat"
        style={styles.fab}
        onPress={() => navigation.navigate('Chatbot')}
        accessibilityLabel="Open Chatbot"
      />

      {/* Property Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {selectedProperty && (
              <View>
                <Text style={styles.modalTitle}>{selectedProperty.title || selectedProperty.propertyType}</Text>
                <Text style={styles.modalPrice}>
                  {selectedProperty.currency || 'NGN'} {selectedProperty.price?.toLocaleString?.() || selectedProperty.price}
                </Text>
                <Text style={styles.modalAddress}>
                  {selectedProperty.address?.street || selectedProperty.address || selectedProperty.location || ''}
                    </Text>
                <Text style={styles.modalDetails}>
                  {selectedProperty.bedrooms} Bed • {selectedProperty.bathrooms} Bath • {selectedProperty.area?.value || selectedProperty.area} {selectedProperty.area?.unit || selectedProperty.areaUnit || ''}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setPreviewModalVisible(false);
                        navigation.navigate('PropertyDetails', { propertyId: selectedProperty._id || selectedProperty.id });
                      }}
                  style={styles.modalButton}
                    >
                  View Details
                    </Button>
                  </View>
            )}
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#f3f9ffff',
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
    borderRadius: 1,
    overflow: 'hidden',
    width: 160,
    minHeight: 200,
    maxWidth: 160,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 1,

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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  modalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  modalDetails: {
    fontSize: 13,
    color: '#444',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  // Loading States
  loadingCard: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfdfdff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loadingProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: 120,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  loadingTitle: {
    width: '80%',
    height: 18,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingPrice: {
    width: '60%',
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingAddress: {
    width: '90%',
    height: 14,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingDetails: {
    width: '70%',
    height: 14,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingPropertiesContainer: {
    width: '100%',
    marginTop: 4,
    marginBottom: 0,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  // Rolling Loader Styles
  rollingLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfdfdff',
  },
  rollingLoaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  rollingLoaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  rollingLoaderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  saveButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default TenantHomeScreen; 