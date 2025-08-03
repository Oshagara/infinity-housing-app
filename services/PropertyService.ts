// services/PropertyService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '../types/Property';

const API_URL = 'https://infinity-housing.onrender.com';

export const fetchLandlordListings = async (): Promise<Property[]> => {
  const user = await AsyncStorage.getItem('landlord_info');
  const token = await AsyncStorage.getItem('access_token');
  if (!user || !token) throw new Error('User not authenticated');

  const userData = JSON.parse(user);
  const userId = userData.userId || userData.id || userData._id;
  if (!userId) throw new Error('User ID not found');

  const response = await fetch(`${API_URL}/property/landlord/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch landlord listings');
  return data as Property[];
};

export const fetchPropertyById = async (id: string): Promise<Property> => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/property/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch property');
  return data as Property;
};

export const createProperty = async (landlordId: string, payload: Partial<Property>) => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/property/${landlordId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create property');
  return data;
};

export const updateProperty = async (id: string, payload: Partial<Property>) => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/property/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update property');
  return data;
};
