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

type Props = NativeStackScreenProps<RootStackParamList, 'AgentHome'>;

export default function AgentHomeScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const userJson = await AsyncStorage.getItem('agent_info');
        if (userJson) {
          const user = JSON.parse(userJson);
          setName(user.name || 'User');
          setUserId(user.userId || '');
          // setProfilePicture(user.profilePicture || user.avatar || '');
        }
      } catch (e) {
        setName('Tenant');
        // setProfilePicture('');
      }
    })();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.mediumTitle}>Hi, Ld. {name}</Text>
          {/* <Text style={styles.subtitle}>ID:{" "} {userId}</Text> */}
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
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('AgentHome')}
        >
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={[styles.tabLabel, styles.activeTab]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('MyListings')}
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
          onPress={() => navigation.navigate('Inquiries')}
        >
          <Ionicons name="chatbubble" size={24} color="#666" />
          <Text style={styles.tabLabel}>Chat</Text>
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