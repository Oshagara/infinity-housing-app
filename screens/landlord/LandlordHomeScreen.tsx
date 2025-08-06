import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'LandlordHome'>;

export default function LandlordHomeScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 Loading landlord user data...');
        
        let userData = null;
        let userName = 'Landlord';
        let userId = '';
        
        // Try to get user data from multiple sources
        const role = await AsyncStorage.getItem('role');
        console.log('🔍 User role:', role);
        
        // Try role-specific data first
        if (role === 'landlord') {
          const landlordJson = await AsyncStorage.getItem('landlord_info');
          if (landlordJson) {
            userData = JSON.parse(landlordJson);
            console.log('🔍 Found landlord_info data');
          }
        } else if (role === 'tenant') {
          const tenantJson = await AsyncStorage.getItem('tenant_info');
          if (tenantJson) {
            userData = JSON.parse(tenantJson);
            console.log('🔍 Found tenant_info data');
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
          const userIdFromStorage = await AsyncStorage.getItem('user_id');
          
          if (name || email || userIdFromStorage) {
            userData = {
              name: name || 'Landlord',
              email: email || '',
              id: userIdFromStorage || '',
            };
            console.log('🔍 Created user data from individual fields');
          }
        }
        
        // Set user data
        if (userData) {
          userName = userData.name || userData.fullName || userData.email || 'Landlord';
          userId = userData.userId || userData.id || userData._id || '';
          console.log('✅ Landlord user data loaded successfully:', userName);
        } else {
          console.log('⚠️ No landlord user data found, using defaults');
        }
        
        setName(userName);
        setUserId(userId);
        
      } catch (e) {
        console.error('❌ Error loading landlord user data:', e);
        setName('Landlord');
        setUserId('');
      }
    })();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.mediumTitle}>Hi, Ld. {name}</Text>
          <Text style={styles.subtitle}>Manage your properties and listings</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddProperty', {})}
          >
            <Text style={styles.actionButtonText}>Add New Property</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.helpButton]}
            onPress={() => navigation.navigate('LandlordChatbot')}
          >
            <Text style={styles.actionButtonText}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('LandlordHome')}
        >
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={[styles.tabLabel, styles.activeTab]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('LandlordListings')}
        >
          <Ionicons name="list" size={24} color="#666" />
          <Text style={styles.tabLabel}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate({ name: 'AddProperty' as any, params: undefined })}
        >
          <Ionicons name="add-circle" size={48} color="#666" />
          <Text style={styles.tabLabel}>Post</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('LandlordChatbot')}
        >
          <Ionicons name="help-circle" size={24} color="#666" />
          <Text style={styles.tabLabel}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={24} color="#666" />
          <Text style={styles.tabLabel}>Account</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingTop: 20,
  },

  mediumTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: '#4CAF50', // A different color for the help button
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
    paddingBottom: 50,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeTab: {
    color: '#007AFF',
  },
}); 