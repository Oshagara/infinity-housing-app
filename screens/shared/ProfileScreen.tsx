import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, IconButton, List, Switch, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🔍 ProfileScreen - Loading user data...');
      
      // Debug: Check all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 ProfileScreen - All AsyncStorage keys:', allKeys);
      
      // First try to get the role to determine which storage key to use
      const role = await AsyncStorage.getItem('role');
      console.log('🔍 ProfileScreen - User role:', role);
      
      // Debug: Check what's actually stored
      const userInfo = await AsyncStorage.getItem('user_info');
      const landlordInfo = await AsyncStorage.getItem('landlord_info');
      const tenantInfo = await AsyncStorage.getItem('tenant_info');
      const name = await AsyncStorage.getItem('name');
      const email = await AsyncStorage.getItem('email');
      
      console.log('🔍 ProfileScreen - Debug storage:');
      console.log('🔍 user_info:', userInfo ? 'exists' : 'null');
      console.log('🔍 landlord_info:', landlordInfo ? 'exists' : 'null');
      console.log('🔍 tenant_info:', tenantInfo ? 'exists' : 'null');
      console.log('🔍 name:', name);
      console.log('🔍 email:', email);
      
      let userData = null;
      
      // Try to get user data based on role
      if (role === 'landlord') {
        const landlordJson = await AsyncStorage.getItem('landlord_info');
        if (landlordJson) {
          userData = JSON.parse(landlordJson);
          console.log('🔍 ProfileScreen - Found landlord data');
        }
      } else if (role === 'tenant') {
        const tenantJson = await AsyncStorage.getItem('tenant_info');
        if (tenantJson) {
          userData = JSON.parse(tenantJson);
          console.log('🔍 ProfileScreen - Found tenant data');
        }
      }
      
      // Fallback to user_info if role-specific data not found
      if (!userData) {
        const userInfoJson = await AsyncStorage.getItem('user_info');
        if (userInfoJson) {
          userData = JSON.parse(userInfoJson);
          console.log('🔍 ProfileScreen - Found user_info data');
        }
      }
      
      // Final fallback - try both landlord and tenant info
      if (!userData) {
        const landlordJson = await AsyncStorage.getItem('landlord_info');
        const tenantJson = await AsyncStorage.getItem('tenant_info');
        
        if (landlordJson) {
          userData = JSON.parse(landlordJson);
          console.log('🔍 ProfileScreen - Found landlord data (fallback)');
        } else if (tenantJson) {
          userData = JSON.parse(tenantJson);
          console.log('🔍 ProfileScreen - Found tenant data (fallback)');
        }
      }
      
      // Final fallback - try individual fields
      if (!userData) {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        const phone = await AsyncStorage.getItem('phone');
        const userId = await AsyncStorage.getItem('user_id');
        
        if (name || email || phone || userId) {
          userData = {
            name: name || 'User',
            email: email || '',
            phone: phone || '',
            id: userId || '',
          };
          console.log('🔍 ProfileScreen - Created user data from individual fields');
        }
      }
      
      if (userData) {
        console.log('✅ ProfileScreen - User data loaded successfully:', userData);
        setUser(userData);
        setFormData({
          name: userData.name || userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
        });
      } else {
        console.log('❌ ProfileScreen - No user data found');
        Alert.alert('Error', 'No user data found. Please log in again.');
      }
    } catch (error) {
      console.error('❌ ProfileScreen - Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setEditLoading(true);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.replace('Login');
        return;
      }

      // Call the API to update profile
      const response = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        token: token,
      });

      // Update local storage with new data
      const role = await AsyncStorage.getItem('role');
      console.log('🔍 ProfileScreen - Updating profile for role:', role);
      
      const updatedUser = { 
        ...user, 
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
      };
      
      // Update role-specific storage
      if (role === 'landlord') {
        await AsyncStorage.setItem('landlord_info', JSON.stringify(updatedUser));
        console.log('✅ ProfileScreen - Updated landlord_info');
      } else if (role === 'tenant') {
        await AsyncStorage.setItem('tenant_info', JSON.stringify(updatedUser));
        console.log('✅ ProfileScreen - Updated tenant_info');
      }
      
      // Also update user_info as a general fallback
      await AsyncStorage.setItem('user_info', JSON.stringify(updatedUser));
      console.log('✅ ProfileScreen - Updated user_info');
      
      setUser(updatedUser);

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out and clearing all data...');
              
              // Clear all authentication and user data
              const keysToRemove = [
                'user_info',
                'user',
                'access_token',
                'role',
                'email',
                'name',
                'user_id',
                'phone',
                'user_email',
                'landlord_info',
                'tenant_info',
                'saved_properties', // Also clear saved properties
              ];

              for (const key of keysToRemove) {
                await AsyncStorage.removeItem(key);
              }

              console.log('✅ All data cleared successfully');
              
              Toast.show({
                type: 'success',
                text1: 'Logged out successfully',
                text2: 'All data has been cleared',
              });
              
              navigation.replace('Login');
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Toast.show({
                type: 'error',
                text1: 'Logout Error',
                text2: 'Please try again',
              });
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting account and clearing all data...');
              
              // Clear all authentication and user data
              const keysToRemove = [
                'user_info',
                'user',
                'access_token',
                'role',
                'email',
                'name',
                'user_id',
                'phone',
                'user_email',
                'landlord_info',
                'tenant_info',
                'saved_properties',
              ];

              for (const key of keysToRemove) {
                await AsyncStorage.removeItem(key);
              }

              console.log('✅ All data cleared successfully');
              
              Toast.show({
                type: 'success',
                text1: 'Account deleted',
                text2: 'All data has been cleared',
              });
              
              navigation.replace('Login');
            } catch (error) {
              console.error('❌ Error during account deletion:', error);
              Toast.show({
                type: 'error',
                text1: 'Deletion Error',
                text2: 'Please try again',
              });
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.profileHeader}>
        <Avatar.Image
          size={80}
          source={user.profilePicture ? { uri: user.profilePicture } : require('../../assets/images/house1.jpg')}
          style={styles.avatar}
        />
        
        {!isEditing ? (
          <>
            <Text style={styles.name}>{user.name}</Text>
            {user.email && <Text style={styles.email}>{user.userId}</Text>}
            <Button
              mode="contained"
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </>
        ) : (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholder="Enter your company name"
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={editLoading}
                loading={editLoading}
              >
                Save
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Profile Settings Section */}
      {!isEditing && (
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>
          
          <List.Section style={styles.settingsList}>
            <List.Item
              title="Change Password"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.settingItem}
            />
            
            <List.Item
              title="Notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color="#007AFF"
                />
              )}
              style={styles.settingItem}
            />
            
            <List.Item
              title="Email Notifications"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  color="#007AFF"
                />
              )}
              style={styles.settingItem}
            />
            
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content would go here.')}
              style={styles.settingItem}
            />
            
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Terms of Service', 'Terms of service content would go here.')}
              style={styles.settingItem}
            />
            
            <List.Item
              title="About"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('About', 'Infinity Housing v1.0.0\n\nYour trusted platform for finding the perfect home.')}
              style={styles.settingItem}
            />
          </List.Section>

          <Divider style={styles.divider} />

          {/* Account Actions */}
          {/* <Text style={styles.settingsTitle}>Account</Text> */}
          
          <List.Section style={styles.settingsList}>
            <List.Item
              title="Logout"
              left={(props) => <List.Icon {...props} icon="logout" color="#FF3B30" />}
              onPress={handleLogout}
              style={[styles.settingItem, styles.dangerItem]}
              titleStyle={styles.dangerText}
            />
            
            <List.Item
              title="Delete Account"
              left={(props) => <List.Icon {...props} icon="delete" color="#FF3B30" />}
              onPress={handleDeleteAccount}
              style={[styles.settingItem, styles.dangerItem]}
              titleStyle={styles.dangerText}
            />
          </List.Section>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  editButton: {
    marginTop: 12,
    width: 180,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
  },
  editForm: {
    width: '100%',
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  settingsSection: {
    marginTop: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginLeft: 8,
  },
  settingsList: {
    paddingHorizontal: 0,
  },
  settingItem: {
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 2,
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
  },
  dangerText: {
    color: '#FF3B30',
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen; 