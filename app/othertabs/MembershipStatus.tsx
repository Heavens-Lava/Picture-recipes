// app/othertabs/MembershipStatus.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MembershipStatus() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌟 Premium Membership</Text>
      <Text style={styles.description}>
        Thank you for supporting Picture Recipes! Here's what you enjoy:
      </Text>

      <View style={styles.benefits}>
        <Text style={styles.bullet}>• Unlimited recipe generations</Text>
        <Text style={styles.bullet}>• No ads</Text>
        <Text style={styles.bullet}>• Grocery list tracking</Text>
        <Text style={styles.bullet}>• AI cooking assistant</Text>
        <Text style={styles.bullet}>• Early access to new features</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Profile</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#10B981',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  benefits: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  bullet: {
    fontSize: 16,
    marginBottom: 8,
    color: '#111827',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
