import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ShoppingCart, Check } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface GroceryTabsProps {
  selectedTab: 'needed' | 'cart';
  onTabChange: (tab: 'needed' | 'cart') => void;
  neededCount: number;
  cartCount: number;
}

export const GroceryTabs: React.FC<GroceryTabsProps> = ({
  selectedTab,
  onTabChange,
  neededCount,
  cartCount,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === 'needed' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('needed')}
        activeOpacity={0.7}
      >
        <ShoppingCart
          size={20}
          color={selectedTab === 'needed' ? '#FFFFFF' : '#6B7280'}
        />
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === 'needed' && styles.tabButtonTextActive,
          ]}
        >
          Need to Buy ({neededCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === 'cart' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('cart')}
        activeOpacity={0.7}
      >
        <Check
          size={20}
          color={selectedTab === 'cart' ? '#FFFFFF' : '#6B7280'}
        />
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === 'cart' && styles.tabButtonTextActive,
          ]}
        >
          In Cart ({cartCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};
