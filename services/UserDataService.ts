import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

interface UserData {
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  preferences: {
    preferredAreas: string[];
    priceRange: {
      min: number;
      max: number;
    };
    propertyTypes: string[];
    amenities: string[];
  };
  behavior: {
    searchHistory: Array<{
      query: string;
      timestamp: string;
      filters: any;
    }>;
    viewHistory: Array<{
      propertyId: string;
      timestamp: string;
      duration: number;
    }>;
    savedProperties: string[];
    contactHistory: Array<{
      propertyId: string;
      agentId: string;
      timestamp: string;
      method: 'call' | 'email' | 'message';
    }>;
  };
  schedule: {
    availableTimes: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    preferredViewingTimes: string[];
  };
  deviceInfo: {
    model: string;
    osVersion: string;
    networkType: string;
    batteryLevel: number;
  };
}

class UserDataService {
  private static instance: UserDataService;
  private userData: UserData | null = null;
  private readonly STORAGE_KEY = '@user_data';

  private constructor() {}

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.requestPermissions();
      await this.loadUserData();
      await this.collectDeviceInfo();
      await this.collectLocationData();
      await this.collectScheduleData();
      this.startPeriodicDataCollection();
    } catch (error) {
      console.error('Error initializing UserDataService:', error);
    }
  }

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
      ];

      for (const permission of permissions) {
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn(`Permission ${permission} not granted`);
        }
      }
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.userData = JSON.parse(data);
      } else {
        this.userData = this.getInitialUserData();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.userData = this.getInitialUserData();
    }
  }

  private getInitialUserData(): UserData {
    return {
      location: {
        latitude: 0,
        longitude: 0,
        lastUpdated: new Date().toISOString(),
      },
      preferences: {
        preferredAreas: [],
        priceRange: {
          min: 0,
          max: 0,
        },
        propertyTypes: [],
        amenities: [],
      },
      behavior: {
        searchHistory: [],
        viewHistory: [],
        savedProperties: [],
        contactHistory: [],
      },
      schedule: {
        availableTimes: [],
        preferredViewingTimes: [],
      },
      deviceInfo: {
        model: '',
        osVersion: '',
        networkType: '',
        batteryLevel: 0,
      },
    };
  }

  private async collectDeviceInfo(): Promise<void> {
    if (!this.userData) return;

    try {
      const deviceInfo = {
        modelName: Device.modelName || '',
        osVersion: Device.osVersion || '',
      };
      const networkState = await Network.getNetworkStateAsync();
      const batteryLevel = 0; // Default value since battery API is not available

      this.userData.deviceInfo = {
        model: deviceInfo.modelName,
        osVersion: deviceInfo.osVersion,
        networkType: networkState.type || 'unknown',
        batteryLevel,
      };

      await this.saveUserData();
    } catch (error) {
      console.error('Error collecting device info:', error);
    }
  }

  private async collectLocationData(): Promise<void> {
    if (!this.userData) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      this.userData.location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        lastUpdated: new Date().toISOString(),
      };

      await this.saveUserData();
    } catch (error) {
      console.error('Error collecting location data:', error);
    }
  }

  private async collectScheduleData(): Promise<void> {
    if (!this.userData) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') return;

      const calendars = await Calendar.getCalendarsAsync();
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days

      const events = await Calendar.getEventsAsync(
        calendars.map(cal => cal.id),
        now,
        end
      );

      const availableTimes = this.processCalendarEvents(events);
      this.userData.schedule.availableTimes = availableTimes;

      await this.saveUserData();
    } catch (error) {
      console.error('Error collecting schedule data:', error);
    }
  }

  private processCalendarEvents(events: Calendar.Event[]): Array<{
    day: string;
    startTime: string;
    endTime: string;
  }> {
    const availableTimes: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }> = [];

    const eventsByDay = events.reduce((acc, event) => {
      const day = new Date(event.startDate).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<string, Calendar.Event[]>);

    Object.entries(eventsByDay).forEach(([day, dayEvents]) => {
      const sortedEvents = dayEvents.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      let lastEnd = new Date(`${day}T09:00:00`); // Start at 9 AM
      const dayEnd = new Date(`${day}T17:00:00`); // End at 5 PM

      sortedEvents.forEach(event => {
        const eventStart = new Date(event.startDate);
        if (eventStart > lastEnd) {
          availableTimes.push({
            day,
            startTime: lastEnd.toISOString(),
            endTime: eventStart.toISOString(),
          });
        }
        lastEnd = new Date(event.endDate);
      });

      if (lastEnd < dayEnd) {
        availableTimes.push({
          day,
          startTime: lastEnd.toISOString(),
          endTime: dayEnd.toISOString(),
        });
      }
    });

    return availableTimes;
  }

  private startPeriodicDataCollection(): void {
    setInterval(() => this.collectLocationData(), 30 * 60 * 1000);
    setInterval(() => this.collectDeviceInfo(), 60 * 60 * 1000);
    setInterval(() => this.collectScheduleData(), 6 * 60 * 60 * 1000);
  }

  private async saveUserData(): Promise<void> {
    if (!this.userData) return;

    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.userData)
      );
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  async updatePreferences(preferences: Partial<UserData['preferences']>): Promise<void> {
    if (!this.userData) return;

    this.userData.preferences = {
      ...this.userData.preferences,
      ...preferences,
    };

    await this.saveUserData();
  }

  async addSearchHistory(search: UserData['behavior']['searchHistory'][0]): Promise<void> {
    if (!this.userData) return;

    this.userData.behavior.searchHistory.push(search);
    if (this.userData.behavior.searchHistory.length > 100) {
      this.userData.behavior.searchHistory.shift();
    }

    await this.saveUserData();
  }

  async addViewHistory(view: UserData['behavior']['viewHistory'][0]): Promise<void> {
    if (!this.userData) return;

    this.userData.behavior.viewHistory.push(view);
    if (this.userData.behavior.viewHistory.length > 100) {
      this.userData.behavior.viewHistory.shift();
    }

    await this.saveUserData();
  }

  async addContactHistory(contact: UserData['behavior']['contactHistory'][0]): Promise<void> {
    if (!this.userData) return;

    this.userData.behavior.contactHistory.push(contact);
    if (this.userData.behavior.contactHistory.length > 100) {
      this.userData.behavior.contactHistory.shift();
    }

    await this.saveUserData();
  }

  async toggleSavedProperty(propertyId: string): Promise<void> {
    if (!this.userData) return;

    const index = this.userData.behavior.savedProperties.indexOf(propertyId);
    if (index === -1) {
      this.userData.behavior.savedProperties.push(propertyId);
    } else {
      this.userData.behavior.savedProperties.splice(index, 1);
    }

    await this.saveUserData();
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getPopularSearchTerms(): Array<{ term: string; count: number }> {
    if (!this.userData) return [];

    const searchTerms = this.userData.behavior.searchHistory.map(s => s.query);
    const termCount = searchTerms.reduce((acc, term) => {
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(termCount)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count);
  }

  getPreferredViewingTimes(): string[] {
    if (!this.userData) return [];

    const contactTimes = this.userData.behavior.contactHistory
      .filter(c => c.method === 'call' || c.method === 'message')
      .map(c => new Date(c.timestamp).getHours());

    const timeCount = contactTimes.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(timeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([hour]) => `${hour}:00`);
  }

  getPreferredAreas(): string[] {
    if (!this.userData) return [];
    return [];
  }
}

export default UserDataService; 