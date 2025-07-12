// app/FullVersionScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getUserProfile } from '../lib/supabaseFunctions';
import { supabase } from '../lib/supabase';

export default function FullVersionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      const profile = await getUserProfile();
      if (profile?.has_premium) {
        router.replace('/thank-you'); // Redirect if already premium
        return;
      }
      setHasPremium(false);
      setLoading(false);
    };

    fetchStatus();
  }, []);

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        Alert.alert('Not logged in', 'Please sign in to upgrade.');
        setCheckoutLoading(false);
        return;
      }

      const accessToken = sessionData.session.access_token;
      const userId = sessionData.session.user.id;
      const priceId = 'price_1RjR3DHXzuAr8BXH3KdsHIOE'; // Your Stripe price ID

      const response = await fetch(
        'https://flqsdjtfkgycvssdbegd.supabase.co/functions/v1/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId, price_id: priceId }),
        }
      );

      const result = await response.json();
      setCheckoutLoading(false);

      if (!response.ok || result.error) {
        console.error('Stripe Checkout error:', result);
        Alert.alert('Error', result.error || 'Could not create session');
        return;
      }

      if (result.url) {
        await Linking.openURL(result.url);
      } else {
        Alert.alert('Error', 'No checkout URL returned.');
      }
    } catch (err) {
      setCheckoutLoading(false);
      console.error('Upgrade error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleRestore = async () => {
    Alert.alert('Restore', 'Restore purchases not implemented yet.');
  };

  const handleContinueLimited = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock Full Version</Text>
      <Text style={styles.description}>
        Upgrade to unlock unlimited recipes, remove ads, and more.
      </Text>

      <View style={styles.benefits}>
        <Text style={styles.bullet}>• Save unlimited recipes</Text>
        <Text style={styles.bullet}>• No ads or interruptions</Text>
        <Text style={styles.bullet}>• Exclusive AI features</Text>
      </View>

      <TouchableOpacity
        style={[styles.upgradeButton, checkoutLoading && { opacity: 0.6 }]}
        onPress={handleUpgrade}
        disabled={checkoutLoading}
      >
        {checkoutLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.upgradeText}>Upgrade for $4.99</Text>
        )}
      </TouchableOpacity>

      <Text style={{ color: '#FF6B6B', marginBottom: 12 }}>
        (Full app 1 time purchase)
      </Text>

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreText}>Restore Purchase</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinueLimited}>
        <Text style={styles.continueText}>
          Continue with free version (Limit 5 Recipes)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  benefits: {
    marginBottom: 30,
    alignSelf: 'stretch',
  },
  bullet: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  upgradeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    padding: 10,
  },
  restoreText: {
    color: '#666',
    fontSize: 14,
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  continueText: {
    fontSize: 14,
    color: '#555',
  },
});
