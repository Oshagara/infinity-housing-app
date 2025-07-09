// components/PropertyForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, GestureResponderEvent } from 'react-native';

import { Property } from '../types/Property';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  initialData: Partial<Property>;
  onSubmit: (formData: Partial<Property>) => void;
  isEdit: boolean;
}

export default function PropertyForm({ initialData, onSubmit, isEdit }: Props) {
  const [formData, setFormData] = useState<Partial<Property>>(initialData);

  const updateField = (key: keyof Property, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePress = () => {
    if (!formData.listingType || !formData.price || !formData.propertyType) {
      alert('Please fill in required fields');
      return;
    }
    onSubmit(formData);
  };

  function pickFile(event: GestureResponderEvent): void {
    throw new Error('Function not implemented.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={formData.listingType || ''}
        onChangeText={(text) => updateField('listingType', text)}
        placeholder="Enter property title"
      />

      <Text style={styles.label}>Price (₦)</Text>
      <TextInput
        style={styles.input}
        value={formData.price?.toString() || ''}
        onChangeText={(text) => updateField('price', parseFloat(text) || 0)}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Property Type</Text>
      <TextInput
        style={styles.input}
        value={formData.propertyType || ''}
        onChangeText={(text) => updateField('propertyType', text)}
        placeholder="e.g. Duplex, Apartment"
      />

      <View style={styles.rowContainer}>
  <TouchableOpacity style={styles.plusButton} onPress={pickFile}>
    <Icon name="plus" size={12} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity style={styles.plusButton} onPress={pickFile}>
    <Icon name="plus" size={12} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity style={styles.plusButton} onPress={pickFile}>
    <Icon name="plus" size={12} color="#fff" />
  </TouchableOpacity>

   <TouchableOpacity style={styles.plusButton} onPress={pickFile}>
    <Icon name="plus" size={12} color="#fff" />
  </TouchableOpacity>

   <TouchableOpacity style={styles.plusButton} onPress={pickFile}>
    <Icon name="plus" size={12} color="#fff" />
  </TouchableOpacity>
</View>


      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{isEdit ? 'Update Property' : 'Create Property'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rowContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between', // or 'center' or 'flex-start'
  alignItems: 'center',
  gap: 10, // RN 0.71+, or use marginRight on buttons instead
  marginBottom: 20,
},
  plusButton: {
    backgroundColor: '#f6f6f6f6',
    width: 70,
    height: 70,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
