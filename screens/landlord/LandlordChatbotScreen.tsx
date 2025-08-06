import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  options?: string[];
  type?: 'quick_reply';
}

export default function LandlordChatbotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('Landlord');

  useEffect(() => {
    loadUserData();
    addBotMessage(
      "Hello! I'm your landlord assistant. How can I help you today?",
      [
        'Login Issues',
        'Posting Properties',
        'Technical Problems',
        'Account Management',
        'Property Management',
        'General Help'
      ]
    );
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('landlord_info');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.name || user.fullName || 'Landlord');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const addMessage = (text: string, isUser: boolean = true) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (text: string, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
      options,
      type: options ? 'quick_reply' : undefined,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Login Issues
    if (input.includes('login') || input.includes('sign in') || input.includes('password')) {
      return "For login issues:\n\n1. Make sure your email and password are correct\n2. Check your internet connection\n3. Try resetting your password\n4. Contact support if the problem persists\n\nWould you like me to help you with any specific login problem?";
    }
    
    // Posting Properties
    if (input.includes('post') || input.includes('property') || input.includes('listing') || input.includes('add property')) {
      return "For posting properties:\n\n1. Go to the 'Add Property' section\n2. Fill in all required fields (title, description, price, location)\n3. Upload clear property photos\n4. Set your contact information\n5. Review and submit\n\nAre you having trouble with any specific step?";
    }
    
    // Technical Problems
    if (input.includes('technical') || input.includes('error') || input.includes('bug') || input.includes('crash')) {
      return "For technical issues:\n\n1. Try closing and reopening the app\n2. Check your internet connection\n3. Update the app to the latest version\n4. Clear app cache and data\n5. Contact technical support\n\nCan you describe the specific error you're seeing?";
    }
    
    // Account Management
    if (input.includes('account') || input.includes('profile') || input.includes('settings')) {
      return "For account management:\n\n1. Update your profile in the 'Account' section\n2. Change password in settings\n3. Update contact information\n4. Manage notification preferences\n5. View your activity history\n\nWhat would you like to update?";
    }
    
    // Property Management
    if (input.includes('manage') || input.includes('edit') || input.includes('delete') || input.includes('update property')) {
      return "For property management:\n\n1. View all your listings in 'My Listings'\n2. Edit property details by tapping on the property\n3. Update photos and information\n4. Mark properties as sold/rented\n5. Delete listings if needed\n\nWhich property would you like to manage?";
    }
    
    // General Help
    if (input.includes('help') || input.includes('support') || input.includes('contact')) {
      return "General help:\n\n1. Check our FAQ section\n2. Contact customer support\n3. Email us at support@infinityhousing.com\n4. Call us at +1-800-INFINITY\n5. Live chat available 24/7\n\nHow can I assist you further?";
    }
    
    // Default response
    return "I'm here to help with:\n\n• Login and account issues\n• Posting and managing properties\n• Technical problems\n• General enquiries\n\nPlease let me know what specific help you need!";
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    addMessage(inputText);
    setInputText('');
    
    setIsTyping(true);
    setTimeout(() => {
      const response = generateBotResponse(inputText);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (option: string) => {
    addMessage(option);
    setInputText('');
    
    setIsTyping(true);
    setTimeout(() => {
      const response = generateBotResponse(option);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000);
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, message.isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
      </View>
      
      {message.options && message.type === 'quick_reply' && (
        <View style={styles.optionsContainer}>
          {message.options.map((option, index) => (
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Landlord Assistant</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.typingText}>Assistant is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? "#fff" : "#ccc"} />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
}); 