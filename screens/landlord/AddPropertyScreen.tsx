// screens/landlord/AddPropertyScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import { Property } from '../../types/Property';
import { fetchPropertyById, createProperty, updateProperty } from '../../services/PropertyService';
import PropertyForm from '../../components/PropertyForm';
import PropertyForm2 from '../../components/PropertyForm2';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProperty'>;

export default function AddPropertyScreen({ navigation, route }: Props) {
  const [propertyData, setPropertyData] = useState<Partial<Property> | null>(null);
  const [loading, setLoading] = useState<boolean>(!!route.params?.listingId);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!route.params?.listingId;

  useEffect(() => {
    if (isEdit) {
      loadProperty();
    }
  }, []);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await fetchPropertyById(route.params!.listingId!);
      setPropertyData(data);
      console.log('✅ Loaded property for editing:', data);
    } catch (err: any) {
      console.error('❌ Error loading property:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to load property',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Property>) => {
    try {
      setSubmitting(true);
      
      if (isEdit) {
        await updateProperty(route.params!.listingId!, formData);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Property updated successfully!',
        });
        console.log('✅ Property updated successfully');
      } else {
        await createProperty(
          route.params?.additionalData?.id || '', // or the appropriate string identifier
          formData
        );
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Property created successfully!',
        });
        console.log('✅ Property created successfully');
      }
      
      // Navigate back after a short delay to show the toast
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error submitting property:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to save property',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All unsaved changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Property' : 'Add New Property'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isEdit ? 'Loading property...' : 'Preparing form...'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formHeader}>
            <Ionicons 
              name={isEdit ? "create" : "add-circle"} 
              size={24} 
              color="#007AFF" 
            />
            <Text style={styles.formTitle}>
              {isEdit ? 'Edit Property Details' : 'Property Information'}
            </Text>
          </View>
          
          <Text style={styles.formSubtitle}>
            {isEdit 
              ? 'Update your property information below'
              : 'Fill in the details to list your property'
            }
          </Text>

          <PropertyForm2
            initialData={propertyData || {}}
            onSubmit={handleSubmit}
            isEdit={isEdit}
          />
          
          {submitting && (
            <View style={styles.submittingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.submittingText}>
                {isEdit ? 'Updating property...' : 'Creating property...'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  submittingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  submittingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
});
