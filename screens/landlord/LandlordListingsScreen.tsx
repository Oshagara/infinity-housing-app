// screens/LandlordListingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import { Property } from '../../types/Property';
import { fetchLandlordListings } from '../../services/PropertyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LandlordListings'>;

export default function LandlordListingsScreen({ navigation }: Props) {
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthAndLoadListings();
  }, []);

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
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AddProperty', { listingId: item.id })}
      style={{ padding: 12, marginBottom: 10, backgroundColor: '#f2f2f2', borderRadius: 8 }}
    >
      <Image source={{ uri: item.images[0] }} style={{ height: 160, borderRadius: 6 }} />
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>{item.listingType}</Text>
      <Text>₦{item.price.toLocaleString()}</Text>
      <Text>{item.address.country || item.address.city}, {item.address.state}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No listings found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}
