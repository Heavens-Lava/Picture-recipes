import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface GroceryItemData {
  id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

interface GroceryItemProps {
  item: GroceryItemData;
  price?: number;
  showCheckbox?: boolean;
  onToggleCart: (id: string) => void;
  onRemove: (id: string) => void;
}

export const GroceryItem: React.FC<GroceryItemProps> = ({
  item,
  showCheckbox = true,
  onToggleCart,
  onRemove,
}) => {
  return (
    <View style={styles.groceryItem}>
      {showCheckbox && (
        <TouchableOpacity
          style={[styles.checkbox, item.inCart && styles.checkboxChecked]}
          onPress={() => onToggleCart(item.id)}
          activeOpacity={0.7}
        >
          {item.inCart && <Check size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => onToggleCart(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemName, item.inCart && styles.itemNameChecked]}>
          {item.name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};
