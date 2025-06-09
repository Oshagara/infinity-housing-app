import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetails'>;

const { width } = Dimensions.get('window');

// Mock property data - in a real app, this would come from an API
const MOCK_PROPERTY = {
  id: '1',
  title: 'Modern Apartment in Downtown',
  price: 2500,
  location: 'Downtown, City',
  address: '123 Main Street, Downtown, City',
  bedrooms: 2,
  bathrooms: 2,
  area: 1200,
  description: 'Beautiful modern apartment in the heart of downtown. Recently renovated with high-end finishes and appliances. Features include hardwood floors, stainless steel appliances, and a private balcony with city views.',
  images: [
    'https://picsum.photos/400/300',
    'https://picsum.photos/400/300',
    'https://picsum.photos/400/300',
  ],
  amenities: [
    'Parking',
    'Gym',
    'Pool',
    'Security',
    'Elevator',
    'Air Conditioning',
  ],
  agent: {
    name: 'John Smith',
    phone: '+1 234 567 8900',
    email: 'john.smith@example.com',
  },
};

export default function PropertyDetailsScreen({ navigation, route }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const imageListRef = useRef<FlatList>(null);

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
    Alert.alert(
      'Contact Agent',
      `Would you like to contact ${MOCK_PROPERTY.agent.name}?`,
      [
        {
          text: 'Call',
          onPress: () => Alert.alert('Call', `Calling ${MOCK_PROPERTY.agent.phone}`),
        },
        {
          text: 'Email',
          onPress: () => Alert.alert('Email', `Emailing ${MOCK_PROPERTY.agent.email}`),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <FlatList
            ref={imageListRef}
            data={MOCK_PROPERTY.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          <View style={styles.imageDots}>
            {MOCK_PROPERTY.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
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
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{MOCK_PROPERTY.title}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveButton, isSaved && styles.savedButton]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>${MOCK_PROPERTY.price}/month</Text>
          <Text style={styles.location}>{MOCK_PROPERTY.location}</Text>
          <Text style={styles.address}>{MOCK_PROPERTY.address}</Text>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{MOCK_PROPERTY.bedrooms}</Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{MOCK_PROPERTY.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{MOCK_PROPERTY.area}</Text>
              <Text style={styles.detailLabel}>Sq Ft</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{MOCK_PROPERTY.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {MOCK_PROPERTY.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent Information</Text>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{MOCK_PROPERTY.agent.name}</Text>
              <Text style={styles.agentContact}>{MOCK_PROPERTY.agent.phone}</Text>
              <Text style={styles.agentContact}>{MOCK_PROPERTY.agent.email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contact Agent</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  agentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  agentContact: {
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
}); 