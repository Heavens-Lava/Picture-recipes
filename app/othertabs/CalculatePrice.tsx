import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const CalculatePrice = () => {
  const [session, setSession] = useState<any>(null);
  const [inCartItems, setInCartItems] = useState<any[]>([]);
  const [needToBuyItems, setNeedToBuyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
      } else {
        router.replace('../othertabs/CreateAccount');
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    const fetchGroceryData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('grocery')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching grocery data:', error);
        setLoading(false);
        return;
      }

      const inCart = data.filter((item) => item.in_cart);
      const toBuy = data.filter((item) => !item.in_cart);

      setInCartItems(inCart);
      setNeedToBuyItems(toBuy);
      setLoading(false);
    };
    fetchGroceryData();
  }, [session]);

  const calculateTotal = (items: any[]) =>
    items.reduce(
      (sum, item) => sum + (item.quantity || 1) * (item.price || 0),
      0
    );

  const renderSection = (
    title: string,
    icon: string,
    data: any[],
    color: string
  ) => (
    <View style={[styles.section, { borderColor: color }]}>
      <Text style={[styles.sectionTitle, { color }]}>
        <Text>{icon} </Text>
        <Text>{title}</Text>
      </Text>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>No items found.</Text>
      ) : (
        <>
          {data.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemName}>
                {item.ingredient_name} x{item.quantity || 1}
              </Text>
              <Text style={styles.itemPrice}>
                ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalText, { color }]}>Total:</Text>
            <Text style={[styles.totalText, { color }]}>
              ${calculateTotal(data).toFixed(2)}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
          Loading your grocery list…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>🧾 Grocery Price Estimate</Text>
      {renderSection('Need to Buy', '🛒', needToBuyItems, '#ef4444')}
      {/* Red */}
      {renderSection('In Cart', '🧺', inCartItems, '#22c55e')} {/* Green */}
    </ScrollView>
  );
};

export default CalculatePrice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
