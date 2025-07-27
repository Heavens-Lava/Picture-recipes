import React from 'react';
import { Animated, View, Text } from 'react-native';
import { Check, ShoppingCart } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface ToastNotificationProps {
  visible: boolean;
  type: 'added' | 'removed';
  itemName: string;
  opacity: Animated.Value;
  translateY: Animated.Value;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  type,
  itemName,
  opacity,
  translateY,
}) => {
  if (!visible) return null;

  const isAdded = type === 'added';

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, !isAdded && styles.toastRemoved]}>
        <View style={[styles.toastIcon, !isAdded && styles.toastIconRemoved]}>
          {isAdded ? (
            <Check size={20} color="#FFFFFF" />
          ) : (
            <ShoppingCart size={20} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastTitle}>
            {isAdded ? 'Added to Cart!' : 'Back to Shopping List!'}
          </Text>
          <Text style={styles.toastMessage} numberOfLines={1}>
            {itemName}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
