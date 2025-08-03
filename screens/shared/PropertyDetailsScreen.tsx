import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import axios from 'axios';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetails'>;

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen({ navigation, route }: Props) {
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const imageListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const { propertyId } = route.params;
        const response = await axios.get(`https://infinity-housing.onrender.com/property/${propertyId}`);
        setProperty(response.data);
      } catch (err: any) {
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [route.params]);

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentImageIndex(index);
  };

  const handleDotPress = (index: number) => {
    imageListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentImageIndex(index);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from Saved' : 'Saved to Favorites',
      isSaved ? 'Property removed from your saved properties.' : 'Property added to your saved properties.'
    );
  };

  const handleContact = () => {
    if (!property?.landlord) return;
    Alert.alert(
      'Contact Landlord',
      `Would you like to contact ${property.landlord.name || 'the landlord'}?`,
      [
        {
          text: 'Call',
                      onPress: () => Alert.alert('Call', `Calling ${property.landlord.phone || ''}`),
        },
        {
          text: 'Email',
                      onPress: () => Alert.alert('Email', `Emailing ${property.landlord.email || ''}`),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error || 'Property not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare images array (handle both string and object with url, and ensure absolute URLs)
  const makeAbsoluteUrl = (url: string) =>
    url && url.startsWith('http')
      ? url
      : url
      ? `https://infinity-housing.onrender.com${url.startsWith('/') ? url : '/' + url}`
      : '';

  const images = property.images?.map((img: any) => {
    const url = typeof img === 'string' ? img : img.url || img;
    return url ? makeAbsoluteUrl(url) : '';
  }).filter(Boolean) || [];

  console.log('PROPERTY DATA:', property);

  console.log('DETAILS IMAGES:', images);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <FlatList
              ref={imageListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.mainImage} />
              )}
              keyExtractor={(_, index) => index.toString()}
            />
          ) : (
            <View style={[styles.mainImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
              <Text>No Image</Text>
            </View>
          )}
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.imageDots}>
            {images.map((_: any, index: React.Key | null | undefined) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(Number(index))}
              >
                <View
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.activeDot,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          {/* Floating Save Button */}
          <TouchableOpacity style={styles.fabSave} onPress={handleSave}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={28} color={isSaved ? '#e74c3c' : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title, Price, Location */}
          <Text style={styles.title}>{property.title || property.propertyType}</Text>
          <Text style={styles.price}>{property.currency || 'NGN'} {property.price?.toLocaleString?.() || property.price}</Text>
          <Text style={styles.location}>{property.address?.city || property.location || ''}</Text>
          <Text style={styles.address}>{property.address?.street || property.address || ''}</Text>

          {/* Quick Details Row */}
          <View style={styles.quickDetailsRow}>
            <View style={styles.quickDetailItem}>
              <MaterialCommunityIcons name="bed-king-outline" size={22} color="#007AFF" />
              <Text style={styles.quickDetailText}>{property.bedrooms} Bed</Text>
            </View>
            <View style={styles.quickDetailItem}>
              <MaterialCommunityIcons name="shower" size={22} color="#007AFF" />
              <Text style={styles.quickDetailText}>{property.bathrooms} Bath</Text>
            </View>
            <View style={styles.quickDetailItem}>
              <FontAwesome5 name="toilet" size={20} color="#007AFF" />
              <Text style={styles.quickDetailText}>{property.toilets} Toilet</Text>
            </View>
            <View style={styles.quickDetailItem}>
              <MaterialCommunityIcons name="ruler-square" size={22} color="#007AFF" />
              <Text style={styles.quickDetailText}>{property.area?.value} {property.area?.unit}</Text>
            </View>
          </View>

          {/* Section Cards */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Listing Type:</Text><Text style={styles.cardValue}>{property.listingType}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Property Type:</Text><Text style={styles.cardValue}>{property.propertyType}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Year Built:</Text><Text style={styles.cardValue}>{property.yearBuilt}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Floors:</Text><Text style={styles.cardValue}>{property.floors}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Furnishing:</Text><Text style={styles.cardValue}>{property.furnishing}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Flooring:</Text><Text style={styles.cardValue}>{Array.isArray(property.flooring) ? property.flooring.join(', ') : property.flooring}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Availability:</Text><Text style={styles.cardValue}>{property.availability}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Is Negotiable:</Text><Text style={styles.cardValue}>{property.isNegotiable ? 'Yes' : 'No'}</Text></View>
          </View>

          {/* Posted By Information */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.postedByInfo}>
              <View style={styles.postedByRow}>
                <Text style={styles.postedByLabel}>Landlord ID:</Text>
                <Text style={styles.postedByValue}>{property.landlordId || property.landlord?.id || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Address Info</Text>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Street:</Text><Text style={styles.cardValue}>{property.address?.street}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Area:</Text><Text style={styles.cardValue}>{property.address?.area}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>City:</Text><Text style={styles.cardValue}>{property.address?.city}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>State:</Text><Text style={styles.cardValue}>{property.address?.state}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>LGA:</Text><Text style={styles.cardValue}>{property.address?.lga}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Country:</Text><Text style={styles.cardValue}>{property.address?.country}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Longitude:</Text><Text style={styles.cardValue}>{property.address?.coordinates?.coordinates?.[0]}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Latitude:</Text><Text style={styles.cardValue}>{property.address?.coordinates?.coordinates?.[1]}</Text></View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Financial & Legal</Text>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Maintenance Fee:</Text><Text style={styles.cardValue}>{property.financialDetails?.maintenanceFee}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Agency Fee:</Text><Text style={styles.cardValue}>{property.financialDetails?.agencyFee}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Payment Plan:</Text><Text style={styles.cardValue}>{property.financialDetails?.paymentPlan?.join(', ')}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Ownership:</Text><Text style={styles.cardValue}>{property.legalStatus?.ownership}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Certificate of Occupancy:</Text><Text style={styles.cardValue}>{property.legalStatus?.cOfO ? 'Yes' : 'No'}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Governor Consent:</Text><Text style={styles.cardValue}>{property.legalStatus?.governorConsent ? 'Yes' : 'No'}</Text></View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Pet Policy:</Text><Text style={styles.cardValue}>{property.additionalInfo?.petPolicy}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Target Tenant:</Text><Text style={styles.cardValue}>{property.additionalInfo?.targetTenant}</Text></View>
            <View style={styles.cardRow}><Text style={styles.cardLabel}>Proximity to Road:</Text><Text style={styles.cardValue}>{property.additionalInfo?.proximityToRoad}</Text></View>
          </View>

          {/* Description */}
          {property.description && (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenities}>
                {property.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={styles.amenityItem}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Landlord Info */}
          {property.landlord && (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Landlord Information</Text>
              <View style={styles.landlordInfo}>
                <Text style={styles.landlordName}>{property.landlord.name}</Text>
                <Text style={styles.landlordContact}>{property.landlord.phone}</Text>
                <Text style={styles.landlordContact}>{property.landlord.email}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contact Landlord</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savedButton: {
    color: '#34C759',
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    backgroundColor: '#fefefeff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  landlordInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  landlordContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 8,
    zIndex: 10,
  },
  fabSave: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 8,
    zIndex: 10,
  },
  quickDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  quickDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickDetailText: {
    fontSize: 13,
    color: '#222',
    marginTop: 4,
    fontWeight: '500',
  },
  cardSection: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderBottomColor: '#f0f0f0ff',
    borderBottomWidth: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    color: '#888',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  cardValue: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  postedByInfo: {
    marginTop: 8,
  },
  postedByRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postedByLabel: {
    color: '#888',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  postedByValue: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
}); 