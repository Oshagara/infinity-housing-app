import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, IconButton, Card, Button, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Chatbot'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'options' | 'property';
}

const ChatbotScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Infinity Housing assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const quickOptions = [
    'View Properties',
    'Schedule Viewing',
    'Price Information',
    'Location Details',
    'Agent Contact',
    'Payment Plans',
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: botResponse.type,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): { text: string; type?: 'text' | 'options' | 'property' } => {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return {
        text: 'Hi there! I can help you with property inquiries, scheduling viewings, or answering questions about our listings. What would you like to know?',
        type: 'options',
      };
    }

    if (input.includes('property') || input.includes('view') || input.includes('listing')) {
      return {
        text: 'Great! I can help you browse properties. Would you like to see available listings or do you have specific requirements?',
        type: 'options',
      };
    }

    if (input.includes('price') || input.includes('cost') || input.includes('rent')) {
      return {
        text: 'I can provide pricing information for our properties. What type of property are you interested in (apartment, house, commercial) and what\'s your budget range?',
      };
    }

    if (input.includes('schedule') || input.includes('viewing') || input.includes('visit')) {
      return {
        text: 'I\'d be happy to help you schedule a property viewing! Please let me know which property you\'re interested in and your preferred date/time.',
      };
    }

    if (input.includes('agent') || input.includes('contact') || input.includes('speak')) {
      return {
        text: 'I can connect you with our agents. Would you like to speak with a specific agent or should I assign one based on your requirements?',
      };
    }

    if (input.includes('location') || input.includes('area') || input.includes('neighborhood')) {
      return {
        text: 'I can provide information about different neighborhoods and areas. What type of location are you looking for (downtown, suburbs, quiet area, etc.)?',
      };
    }

    if (input.includes('payment') || input.includes('finance') || input.includes('plan')) {
      return {
        text: 'We offer various payment plans and financing options. Would you like to know about our installment plans, mortgage options, or rental payment terms?',
      };
    }

    return {
      text: 'I\'m here to help! You can ask me about properties, pricing, scheduling viewings, or connecting with agents. What would you like to know?',
      type: 'options',
    };
  };

  const handleQuickOption = (option: string) => {
    handleSendMessage(option);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {item.type === 'options' && !item.isUser && (
        <View style={styles.optionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickOptions.map((option, index) => (
              <Chip
                key={index}
                style={styles.optionChip}
                textStyle={styles.optionChipText}
                onPress={() => handleQuickOption(option)}
              >
                {option}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
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
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Infinity Housing Assistant</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <IconButton
          icon="more-vert"
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
        <IconButton
          icon="send"
          size={24}
          disabled={!inputText.trim()}
          onPress={() => handleSendMessage(inputText)}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  optionChipText: {
    fontSize: 14,
    color: '#333',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
    opacity: 0.6,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
});

export default ChatbotScreen; 