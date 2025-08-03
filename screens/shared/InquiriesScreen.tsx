import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import UserDataService from '../services/UserDataService';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Inquiries'>;

// Mock data - in a real app, this would come from an API
const MOCK_INQUIRIES = [
  {
    id: '1',
    propertyTitle: 'Modern Apartment in Downtown',
    inquirerName: 'John Doe',
    inquirerEmail: 'john.doe@example.com',
    inquirerPhone: '+1 234 567 8900',
    message: 'I am interested in viewing this property. When would be a good time?',
    date: '2024-03-15T10:30:00',
    status: 'pending',
    urgency: 'high',
    preferredViewingTime: '2024-03-16T14:00:00',
  },
  {
    id: '2',
    propertyTitle: 'Spacious Family Home',
    inquirerName: 'Jane Smith',
    inquirerEmail: 'jane.smith@example.com',
    inquirerPhone: '+1 234 567 8901',
    message: 'Is this property still available? I would like to schedule a viewing.',
    date: '2024-03-14T15:45:00',
    status: 'responded',
    urgency: 'medium',
    preferredViewingTime: '2024-03-15T16:00:00',
  },
];

type Inquiry = typeof MOCK_INQUIRIES[0];

type UrgencyLevel = 'high' | 'medium' | 'low';
type StatusType = 'pending' | 'responded';

type Styles = {
  [key: string]: any;
  highUrgency: any;
  mediumUrgency: any;
  lowUrgency: any;
  pendingBadge: any;
  respondedBadge: any;
};

export default function InquiriesScreen({ navigation }: Props) {
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [isLoading, setIsLoading] = useState(false);

  const sortedInquiries = useMemo(() => {
    return [...inquiries].sort((a, b) => {
      // First sort by status (pending first)
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      // Then sort by urgency
      if (a.urgency !== b.urgency) {
        const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      // Finally sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [inquiries]);

  const getTimeRemaining = (date: string) => {
    const inquiryDate = new Date(date);
    const now = new Date();
    const hoursRemaining = Math.floor((inquiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursRemaining < 0) return 'Overdue';
    if (hoursRemaining < 24) return `${hoursRemaining}h remaining`;
    return `${Math.floor(hoursRemaining / 24)}d remaining`;
  };

  const handleRespond = (inquiry: Inquiry) => {
    Alert.alert(
      'Respond to Inquiry',
      `Would you like to respond to ${inquiry.inquirerName}'s inquiry about ${inquiry.propertyTitle}?`,
      [
        {
          text: 'Schedule Viewing',
          onPress: () => {
            Alert.alert(
              'Schedule Viewing',
              `Would you like to schedule a viewing for ${inquiry.preferredViewingTime}?`,
              [
                {
                  text: 'Confirm',
                  onPress: () => {
                    setInquiries(inquiries.map(i => 
                      i.id === inquiry.id ? { ...i, status: 'responded' } : i
                    ));
                    Alert.alert('Success', 'Viewing scheduled successfully!');
                  },
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
          },
        },
        {
          text: 'Email',
          onPress: () => Alert.alert('Email', `Emailing ${inquiry.inquirerEmail}`),
        },
        {
          text: 'Call',
          onPress: () => Alert.alert('Call', `Calling ${inquiry.inquirerPhone}`),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleMarkAsResponded = (inquiry: Inquiry) => {
    setInquiries(inquiries.map(i => 
      i.id === inquiry.id ? { ...i, status: 'responded' } : i
    ));
  };

  const renderInquiry = ({ item }: { item: Inquiry }) => (
    <View style={styles.inquiryCard}>
      <View style={styles.inquiryHeader}>
        <Text style={styles.propertyTitle}>{item.propertyTitle}</Text>
        <View style={[styles.statusBadge, styles[item.status + 'Badge']]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.urgencyContainer}>
        <View style={[styles.urgencyBadge, styles[`${item.urgency}Urgency`]]}>
          <Text style={styles.urgencyText}>{item.urgency.toUpperCase()}</Text>
        </View>
        <Text style={styles.timeRemaining}>{getTimeRemaining(item.date)}</Text>
      </View>

      <View style={styles.inquirerInfo}>
        <Text style={styles.inquirerName}>{item.inquirerName}</Text>
        <Text style={styles.inquirerContact}>{item.inquirerEmail}</Text>
        <Text style={styles.inquirerContact}>{item.inquirerPhone}</Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>Received: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.preferredTime}>
        Preferred Viewing: {new Date(item.preferredViewingTime).toLocaleString()}
      </Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.respondButton]}
          onPress={() => handleRespond(item)}
        >
          <Text style={styles.actionButtonText}>Respond</Text>
        </TouchableOpacity>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.markButton]}
            onPress={() => handleMarkAsResponded(item)}
          >
            <Text style={styles.actionButtonText}>Mark as Responded</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Inquiries</Text>
          <Text style={styles.subtitle}>Manage your property inquiries</Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('LandlordHome')}
        >
          <Ionicons name="home" size={24} color="#666" />
          <Text style={styles.tabLabel}>Home</Text>
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
          onPress={() => navigation.navigate('Inquiries')}
        >
          <Ionicons name="chatbubble" size={24} color="#007AFF" />
          <Text style={[styles.tabLabel, styles.activeTab]}>Inquiries</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={sortedInquiries}
          renderItem={renderInquiry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
    paddingBottom: 10,
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
  list: {
    padding: 16,
  },
  inquiryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FF9500',
  },
  respondedBadge: {
    backgroundColor: '#34C759',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  highUrgency: {
    backgroundColor: '#FF3B30',
  },
  mediumUrgency: {
    backgroundColor: '#FF9500',
  },
  lowUrgency: {
    backgroundColor: '#34C759',
  },
  urgencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  inquirerInfo: {
    marginBottom: 12,
  },
  inquirerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inquirerContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  preferredTime: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  respondButton: {
    backgroundColor: '#007AFF',
  },
  markButton: {
    backgroundColor: '#5856D6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
} as Styles); 