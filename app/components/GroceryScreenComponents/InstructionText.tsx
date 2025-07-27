import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/Grocery.styles';

interface InstructionTextProps {
  type: 'needed' | 'cart';
}

export const InstructionText: React.FC<InstructionTextProps> = ({ type }) => {
  return (
    <View style={styles.instructionContainer}>
      <Text style={styles.instructionText}>
        {type === 'needed'
          ? '💡 Tap on any item or checkbox to add it to your cart'
          : '↩️ Tap on any item to move it back to your shopping list'}
      </Text>
    </View>
  );
};
