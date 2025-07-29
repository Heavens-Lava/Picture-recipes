import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth'; // adjust if your auth hook is different
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const CalculatePrice = () => {
  const [inCartItems, setInCartItems] = useState<any[]>([]);
  const [needToBuyItems, setNeedToBuyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth(); // make sure this returns the current user session

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

  const renderSection = (title: string, data: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>No items found.</Text>
      ) : (
        <>
          {data.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.name} x{item.quantity || 1}
              </Text>
              <Text style={styles.itemText}>
                ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>
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
        <ActivityIndicator size="large" color="#777" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>🧾 Grocery Price Estimate</Text>

      {renderSection('🛒 Need to Buy', needToBuyItems)}
      {renderSection('🧺 In Cart', inCartItems)}
    </ScrollView>
  );
};

export default CalculatePrice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
