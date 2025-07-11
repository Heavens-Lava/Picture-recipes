import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

// Import your Supabase client (adjust path to your actual client)
import { supabase } from '../lib/supabase'; // Make sure this points to where you initialize supabase client


export default function HelpSupport() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


const handleSubmit = async () => {
  if (!name || !email || !message) {
    Alert.alert('Please fill in all fields.');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase
      .from('support_requests')  // your table name
      .insert([{ name, email, message, created_at: new Date() }]);

    if (error) {
      throw error;
    }

    Alert.alert('Support Request Sent', 'Thanks for sending us your message, we will review it shortly.');
    setName('');
    setEmail('');
    setMessage('');
    router.back();
  } catch (error) {
    Alert.alert('Error', 'Failed to submit support request.');
    console.error('Error inserting support request:', error);
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#059669" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Help & Support</Text>

          <Text style={styles.helpMessage}>
            Having trouble? Please let us know about any bugs or issues you encounter so we can improve the app!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
              placeholderTextColor="#9CA3AF" // Light gray placeholder
          />

          <TextInput
            style={styles.input}
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
                    placeholderTextColor="#9CA3AF" // Light gray placeholder
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue or question..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
                    placeholderTextColor="#9CA3AF" // Light gray placeholder
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
<Text style={styles.footerNote}>
  You can also use this form to send feedback, feature requests, or app improvement ideas! You can also tell me how cool this app is! 😄
</Text>


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpMessage: {
    fontSize: 16,
    color: '#061933',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#243144',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
  fontSize: 14,
  color: '#6B7280', // gray-500
  marginTop: 16,
  textAlign: 'center',
  lineHeight: 20,
},

});
