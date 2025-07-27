import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { styles } from '../../styles/Grocery.styles';

interface ManualAddModalProps {
  visible: boolean;
  newItemName: string;
  onClose: () => void;
  onItemNameChange: (name: string) => void;
  onAddItem: () => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  visible,
  newItemName,
  onClose,
  onItemNameChange,
  onAddItem,
}) => {
  const handleCancel = () => {
    onClose();
    onItemNameChange('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Item Manually</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.textInput}
              value={newItemName}
              onChangeText={onItemNameChange}
              placeholder="Enter item name (e.g., Bananas, Milk, Bread)"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={onAddItem}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={onAddItem}
              activeOpacity={0.7}
            >
              <Text style={styles.modalAddButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
