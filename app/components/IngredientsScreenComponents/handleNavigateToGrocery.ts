import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Router } from 'expo-router';
import { Alert } from 'react-native';

export const handleNavigateToGrocery = async (
  selectedIngredients: Set<string>,
  setIngredientList: React.Dispatch<React.SetStateAction<string[]>>,
  router: Router
) => {
  const selectedItems = Array.from(selectedIngredients);
  if (selectedItems.length === 0) return;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  let success = false;

  if (userId) {
    // Fetch existing grocery items for this user to check duplicates
    const { data: existingItems, error: fetchError } = await supabase
      .from('grocery')
      .select('ingredient_name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      Alert.alert('Error', 'Failed to check existing grocery items.');
      return;
    }

    const existingNames = existingItems?.map(item => item.ingredient_name) || [];

    // Filter out duplicates
    const newItems = selectedItems
      .filter(name => !existingNames.includes(name))
      .map(name => ({
        ingredient_name: name,
        user_id: userId,
        in_cart: false,
      }));

    const skippedItems = selectedItems.filter(name => existingNames.includes(name));

    if (newItems.length === 0) {
      Alert.alert(
        'No New Items Added',
        skippedItems.length > 0
          ? `All selected items already exist in your grocery list:\n\n${skippedItems.join(', ')}`
          : 'No items were added.'
      );
      success = true;
    } else {
      const { error } = await supabase.from('grocery').insert(newItems);
      if (error) {
        console.error('❌ Supabase insert error:', error);
        Alert.alert('Error', 'Failed to add new items to grocery list.');
        return;
      }
      success = true;
      Alert.alert(
        'Grocery List Updated',
        `Added: ${newItems.map(i => i.ingredient_name).join(', ')}${
          skippedItems.length > 0
            ? `\n\nSkipped (already exist): ${skippedItems.join(', ')}`
            : ''
        }`
      );
    }
  } else {
    // Local storage path
    try {
      const existingRaw = await AsyncStorage.getItem('groceryItems');
      const existingItems = existingRaw ? JSON.parse(existingRaw) : [];

      const existingNames = existingItems.map((item: any) => item.name);

      // Filter out duplicates
      const newEntries = selectedItems
        .filter(name => !existingNames.includes(name))
        .map(name => ({
          id: `${name}-${Date.now()}`,
          name,
          category: 'Uncategorized',
          needed: true,
          inCart: false,
        }));

      const skippedItems = selectedItems.filter(name => existingNames.includes(name));

      if (newEntries.length > 0) {
        const updated = [...existingItems, ...newEntries];
        await AsyncStorage.setItem('groceryItems', JSON.stringify(updated));
      }

      if (newEntries.length === 0) {
        Alert.alert(
          'No New Items Added',
          skippedItems.length > 0
            ? `All selected items already exist in your grocery list:\n\n${skippedItems.join(', ')}`
            : 'No items were added.'
        );
      } else {
        Alert.alert(
          'Grocery List Updated',
          `Added: ${newEntries.map(i => i.name).join(', ')}${
            skippedItems.length > 0
              ? `\n\nSkipped (already exist): ${skippedItems.join(', ')}`
              : ''
          }`
        );
      }

      success = true;
    } catch (err) {
      console.error('❌ Failed to save to local storage:', err);
      Alert.alert('Error', 'Failed to update local grocery list.');
      return;
    }
  }

  if (success) {
    setIngredientList(prev => prev.filter(ing => !selectedIngredients.has(ing)));
    router.push('/grocery');
  }
};
