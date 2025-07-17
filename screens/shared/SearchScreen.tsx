import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type Property = {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
};

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    price: 2500,
    location: 'Downtown, City',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: 'https://picsum.photos/200/300',
  },
  {
    id: '2',
    title: 'Spacious Family Home',
    price: 3500,
    location: 'Suburbs, City',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    image: 'https://picsum.photos/200/300',
  },
  // Add more mock properties as needed
];

export default function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyPrice}>${item.price}/month</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyDetail}>{item.bedrooms} beds</Text>
          <Text style={styles.propertyDetail}>{item.bathrooms} baths</Text>
          <Text style={styles.propertyDetail}>{item.area} sqft</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Min Price"
              keyboardType="numeric"
              value={filters.minPrice}
              onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Max Price"
              keyboardType="numeric"
              value={filters.maxPrice}
              onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
            />
          </View>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Bedrooms"
              keyboardType="numeric"
              value={filters.bedrooms}
              onChangeText={(text) => setFilters({ ...filters, bedrooms: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Property Type"
              value={filters.propertyType}
              onChangeText={(text) => setFilters({ ...filters, propertyType: text })}
            />
          </View>
          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={MOCK_PROPERTIES}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.propertyList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  applyFiltersButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  propertyList: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#666',
  },
}); 