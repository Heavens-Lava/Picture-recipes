import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Camera, Plus } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface AddItemButtonsProps {
  onCameraPress: () => void;
  onManualAddPress: () => void;
}

export const AddItemButtons: React.FC<AddItemButtonsProps> = ({
  onCameraPress,
  onManualAddPress,
}) => {
  return (
    <View style={styles.addButtonContainer}>
      <TouchableOpacity
        style={[styles.addButton, styles.addButtonPhoto]}
        onPress={onCameraPress}
        activeOpacity={0.7}
      >
        <Camera size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Item (From Photo)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, styles.addButtonManual]}
        onPress={onManualAddPress}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Item (Manually Type)</Text>
      </TouchableOpacity>
    </View>
  );
};
