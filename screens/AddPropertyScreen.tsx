// screens/AddPropertyScreen.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import { Property } from '../types/Property';
import { fetchPropertyById, createProperty, updateProperty } from '../services/PropertyService';
import PropertyForm from '../components/PropertyForm';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProperty'>;

export default function AddPropertyScreen({ navigation, route }: Props) {
  const [propertyData, setPropertyData] = useState<Partial<Property> | null>(null);
  const [loading, setLoading] = useState<boolean>(!!route.params?.listingId);

  const isEdit = !!route.params?.listingId;

  useEffect(() => {
    if (isEdit) {
      loadProperty();
    }
  }, []);

  const loadProperty = async () => {
    try {
      const data = await fetchPropertyById(route.params!.listingId!);
      setPropertyData(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Property>) => {
    try {
      if (isEdit) {
        await updateProperty(route.params!.listingId!, formData);
        Alert.alert('Success', 'Property updated!');
      } else {
        await createProperty(
          route.params?.additionalData?.id || '', // or the appropriate string identifier
          formData
        );
        Alert.alert('Success', 'Property created!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : (
        <PropertyForm
          initialData={propertyData || {}}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      )}
    </SafeAreaView>
  );
}
