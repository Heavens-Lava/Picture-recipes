// components/GroceryScreenComponents/PriceDisplay.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

export const PriceDisplay = ({ price }: { price?: number }) => {
  if (price === undefined) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.priceText}>${price.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
  },
});
