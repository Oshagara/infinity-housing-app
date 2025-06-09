import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Button,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const images = [
  require('../assets/images/house1.jpg'),
  require('../assets/images/house2.jpg'),
  require('../assets/images/house3.jpg'),
];

export default function PreviewScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // Change image
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={images[currentIndex]}
        style={[
          styles.image,
          {
            opacity: fadeAnim,
          },
        ]}
      />

      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <View style={styles.overlay}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Infinity Housing</Text>
          <Text style={styles.subTitle}>
            Find your dream home without the hassle
          </Text>
        
        <View style={styles.buttonColumn}>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserType')}
            style={[styles.button, { backgroundColor: '#007AFF', alignSelf: 'center', minWidth: '90%' }]}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, { borderColor: '#007AFF', borderWidth: 1, alignSelf: 'center', minWidth: '90%' }]}
          >
            <Text style={styles.buttonTextDark}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30 },
  image: { width, height, resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    top: 0,
    width,
    height,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(230, 230, 230, 0.98)',
    padding: 40,
    alignItems: 'center',
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDark: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
