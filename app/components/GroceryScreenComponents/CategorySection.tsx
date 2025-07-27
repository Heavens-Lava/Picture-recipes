import React from 'react';
import { View, Text } from 'react-native';
import { GroceryItem } from './GroceryItem';
import { styles } from '../../styles/Grocery.styles';
import { PriceDisplay } from './PriceDisplay'; // <-- New import

interface GroceryItemData {
  id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

interface CategorySectionProps {
  category: string;
  items: GroceryItemData[];
  showCheckbox?: boolean;

  onToggleCart: (id: string) => void;
  onRemove: (id: string) => void;
  prices?: Record<string, number>; // <-- New prop
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  showCheckbox = true,
  onToggleCart,
  onRemove,
  prices = {},
}) => {
  return (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      {items.map((item) => (
        <View key={item.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{item.name}</Text>
            <PriceDisplay price={prices[item.name.toLowerCase()]} />
          </View>
          <GroceryItem
            item={item}
            showCheckbox={showCheckbox}
            onToggleCart={onToggleCart}
            onRemove={onRemove}
          />
        </View>
      ))}
    </View>
  );
};
