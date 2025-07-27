// screens/CalculatePrice.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/Grocery.styles'; // reuse grocery styles
import { useStorePricing } from '../hooks/useStorePricing';

const stores = ['Walmart', "Fry's", 'Safeway'];

export const CalculatePrice = () => {
  const navigation = useNavigation();
  const [selectedStore, setSelectedStore] = useState<string>('Walmart');
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const prices = useStorePricing(selectedStore, groceryItems);

  useEffect(() => {
    const fetchGroceryItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('grocery')
        .select('name')
        .eq('needed', true);

      if (data) {
        const names = data.map((item) => item.name.toLowerCase());
        setGroceryItems(names);
      }
      setLoading(false);
    };

    fetchGroceryItems();
  }, []);

  const calculateTotal = () => {
    return groceryItems.reduce((sum, name) => {
      const price = prices[name];
      return sum + (price ?? 0);
    }, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Price Calculator</Text>

      {/* Store Selection */}
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        {stores.map((store) => (
          <TouchableOpacity
            key={store}
            style={[
              styles.storeButton,
              selectedStore === store && styles.storeButtonSelected,
            ]}
            onPress={() => setSelectedStore(store)}
          >
            <Text style={styles.storeButtonText}>{store}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <FlatList
          data={groceryItems}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.groceryItem}>
              <Text style={styles.itemName}>{item}</Text>
              <Text style={styles.itemPrice}>
                {prices[item] !== undefined
                  ? `$${prices[item].toFixed(2)}`
                  : '—'}
              </Text>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.totalText}>
                Total: ${calculateTotal().toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Grocery</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalculatePrice;
