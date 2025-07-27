import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart, Camera, List, Plus, Check } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface EmptyStateProps {
  type: 'initial' | 'needed' | 'cart';
  onCameraPress: () => void;
  onIngredientsPress: () => void;
  onManualAddPress: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onCameraPress,
  onIngredientsPress,
  onManualAddPress,
}) => {
  const renderInitialEmpty = () => (
    <>
      <ShoppingCart size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No grocery items yet</Text>
      <Text style={styles.emptyStateText}>
        Get started by adding ingredients from your fridge or typing in a
        grocery item
      </Text>

      <View style={styles.emptyButtonContainer}>
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={onCameraPress}
          activeOpacity={0.7}
        >
          <Camera size={20} color="#059669" />
          <Text style={styles.emptyActionButtonText}>Take Photo</Text>
          <Text style={styles.emptyActionButtonSubtext}>Scan your fridge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={onIngredientsPress}
          activeOpacity={0.7}
        >
          <List size={20} color="#059669" />
          <Text style={styles.emptyActionButtonText}>View Ingredients</Text>
          <Text style={styles.emptyActionButtonSubtext}>
            Browse your pantry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={onManualAddPress}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#059669" />
          <Text style={styles.emptyActionButtonText}>Type Item Manually</Text>
          <Text style={styles.emptyActionButtonSubtext}>
            Add any grocery by name
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderNeededEmpty = () => (
    <>
      <ShoppingCart size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>All set!</Text>
      <Text style={styles.emptyStateText}>
        You have all the ingredients you need
      </Text>
    </>
  );

  const renderCartEmpty = () => (
    <>
      <Check size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>Cart is empty</Text>
      <Text style={styles.emptyStateText}>Add items from your needed list</Text>
    </>
  );

  return (
    <View style={styles.emptyState}>
      {type === 'initial' && renderInitialEmpty()}
      {type === 'needed' && renderNeededEmpty()}
      {type === 'cart' && renderCartEmpty()}
    </View>
  );
};
