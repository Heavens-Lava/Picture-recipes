import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingCart, CheckSquare } from 'lucide-react-native';

interface Props {
  selectedCount: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const GroceryActionButtons = ({ selectedCount, onAdd, onRemove }: Props) => {
  if (selectedCount === 0) return null;

  return (
    <View style={{ marginBottom: 32 }}>
      <TouchableOpacity style={styles.button} onPress={onAdd}>
        <ShoppingCart size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Add {selectedCount} to Grocery List</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#DC2626', marginTop: 12 }]}
        onPress={onRemove}
      >
        <CheckSquare size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Remove {selectedCount} from Grocery (Adds to Cart)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
