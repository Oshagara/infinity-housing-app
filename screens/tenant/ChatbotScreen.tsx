import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconButton, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Chatbot'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'options' | 'property' | 'quick_reply';
  options?: string[];
}

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image?: string;
}

const ChatbotScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserData();
    // Send welcome message
    setTimeout(() => {
      addBotMessage("Hello! 👋 I'm your Infinity Housing Assistant. I can help you with:\n\n🏠 Finding properties\n💰 Price information\n📍 Location details\n📞 Contact landlords\n❓ General questions\n\nHow can I assist you today?", [
        "Find Properties",
        "Price Range",
        "Contact Landlord",
        "Help & Support"
      ]);
    }, 500);
  }, []);

  const loadUserData = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      const userInfo = await AsyncStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setUserName(user.name || user.fullName || 'User');
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const addMessage = (text: string, isUser: boolean, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      type: options ? 'quick_reply' : 'text',
      options,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage(text, false, options);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    addMessage(userMessage, true);
    setInputText('');

    // Simulate typing
    setIsTyping(true);

    // Generate bot response
    setTimeout(() => {
      const response = generateBotResponse(userMessage.toLowerCase());
      addBotMessage(response.text, response.options);
    }, 1500);
  };

  const handleQuickReply = (option: string) => {
    addMessage(option, true);
    setInputText('');

    setTimeout(() => {
      const response = generateBotResponse(option.toLowerCase());
      addBotMessage(response.text, response.options);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): { text: string; options?: string[] } => {
    // Property search related
    if (userInput.includes('find') || userInput.includes('search') || userInput.includes('property') || userInput.includes('house')) {
      return {
        text: "I can help you find properties! 🏠\n\nWhat are you looking for?\n\n• Location preferences\n• Budget range\n• Number of bedrooms\n• Property type",
        options: ["2 Bedroom", "3 Bedroom", "Lagos", "Abuja", "Under ₦500k", "₦500k - ₦1M"]
      };
    }

    // Price related
    if (userInput.includes('price') || userInput.includes('cost') || userInput.includes('budget') || userInput.includes('₦')) {
      return {
        text: "💰 Our properties range from ₦200,000 to ₦5,000,000 per year.\n\nPopular price ranges:\n• ₦200k - ₦500k: Studio/1BR\n• ₦500k - ₦1M: 2-3BR apartments\n• ₦1M - ₦2M: 3-4BR houses\n• ₦2M+: Luxury properties\n\nWhat's your budget range?",
        options: ["Under ₦500k", "₦500k - ₦1M", "₦1M - ₦2M", "Above ₦2M"]
      };
    }

    // Location related
    if (userInput.includes('lagos') || userInput.includes('abuja') || userInput.includes('location') || userInput.includes('area')) {
      return {
        text: "📍 We have properties in major cities:\n\n🏙️ **Lagos**:\n• Victoria Island\n• Lekki\n• Ikeja\n• Surulere\n\n🏛️ **Abuja**:\n• Wuse\n• Maitama\n• Gwarinpa\n• Asokoro\n\nWhich area interests you?",
        options: ["Victoria Island", "Lekki", "Ikeja", "Wuse", "Maitama"]
      };
    }

    // Contact landlord
    if (userInput.includes('contact') || userInput.includes('landlord') || userInput.includes('call') || userInput.includes('phone')) {
      return {
        text: "📞 To contact a landlord:\n\n1. Go to the property details page\n2. Click 'Contact Landlord' button\n3. Choose your preferred method:\n   • Direct call\n   • WhatsApp\n   • Email\n   • In-app message\n\nWould you like me to show you how to find a specific property?",
        options: ["Show Properties", "How to Contact", "Back to Search"]
      };
    }

    // Help and support
    if (userInput.includes('help') || userInput.includes('support') || userInput.includes('how') || userInput.includes('guide')) {
      return {
        text: "🤝 Here's how I can help you:\n\n🔍 **Search Properties**:\n• Browse by location\n• Filter by price\n• Search by features\n\n📱 **App Features**:\n• Save favorite properties\n• Contact landlords\n• Schedule viewings\n• Get notifications\n\n❓ **Need more help?**",
        options: ["Search Guide", "App Features", "Contact Support"]
      };
    }

    // Bedroom preferences
    if (userInput.includes('bedroom') || userInput.includes('room')) {
      return {
        text: "🛏️ We have properties with:\n\n• Studio apartments\n• 1 bedroom\n• 2 bedrooms\n• 3 bedrooms\n• 4+ bedrooms\n\nWhat size are you looking for?",
        options: ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"]
      };
    }

    // Property types
    if (userInput.includes('apartment') || userInput.includes('house') || userInput.includes('duplex') || userInput.includes('flat')) {
      return {
        text: "🏘️ Available property types:\n\n🏢 **Apartments**:\n• Studio apartments\n• 1-4 bedroom flats\n• Penthouse units\n\n🏠 **Houses**:\n• Detached houses\n• Semi-detached\n• Townhouses\n• Duplexes\n\nWhich type interests you?",
        options: ["Apartments", "Houses", "Studio", "Penthouse"]
      };
    }

    // Amenities
    if (userInput.includes('amenity') || userInput.includes('facility') || userInput.includes('parking') || userInput.includes('security')) {
      return {
        text: "🏊‍♂️ Common amenities include:\n\n🛡️ **Security**:\n• 24/7 security\n• CCTV cameras\n• Gated community\n\n🚗 **Parking**:\n• Private parking\n• Street parking\n• Garage\n\n🏊‍♂️ **Recreation**:\n• Swimming pool\n• Gym\n• Playground\n\nWhat amenities are important to you?",
        options: ["Security", "Parking", "Pool/Gym", "All Amenities"]
      };
    }

    // Viewing appointments
    if (userInput.includes('view') || userInput.includes('visit') || userInput.includes('appointment') || userInput.includes('schedule')) {
      return {
        text: "📅 To schedule a property viewing:\n\n1. Select a property\n2. Click 'Schedule Viewing'\n3. Choose your preferred date/time\n4. Landlord will confirm\n\nAvailable time slots:\n• Weekdays: 9AM - 6PM\n• Weekends: 10AM - 4PM\n\nWould you like to browse available properties?",
        options: ["Browse Properties", "Schedule Viewing", "Viewing Guide"]
      };
    }

    // Payment and rent
    if (userInput.includes('payment') || userInput.includes('rent') || userInput.includes('deposit') || userInput.includes('money')) {
      return {
        text: "💳 Payment options:\n\n💰 **Rent Payment**:\n• Monthly payments\n• Quarterly payments\n• Annual payments\n\n💵 **Deposits**:\n• Usually 1-2 months rent\n• Refundable security deposit\n\n💳 **Payment Methods**:\n• Bank transfer\n• Cash\n• Mobile money\n\nNeed help with payment terms?",
        options: ["Payment Terms", "Deposit Info", "Payment Methods"]
      };
    }

    // Default response
    return {
      text: "I'm here to help with your housing needs! 🏠\n\nYou can ask me about:\n• Finding properties\n• Price ranges\n• Locations\n• Contacting landlords\n• Scheduling viewings\n• Payment options\n\nWhat would you like to know?",
      options: ["Find Properties", "Price Range", "Contact Landlord", "Help & Support"]
    };
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
      </View>
      
      {item.options && (
        <View style={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleQuickReply(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.typingText}>Assistant is typing...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Infinity Housing Assistant</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={() => {}}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage(inputText)}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? "#fff" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ebebebff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#fdfdfdff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#abb1f9ff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});

export default ChatbotScreen; 