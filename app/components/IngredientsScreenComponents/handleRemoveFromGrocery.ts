import { Alert } from 'react-native'; 
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Router } from 'expo-router';

export const handleRemoveFromGrocery = async (
  selectedIngredients: Set<string>,
  setIngredientList: React.Dispatch<React.SetStateAction<string[]>>,
  router: Router
) => {
  const selectedItems = Array.from(selectedIngredients);
  if (selectedItems.length === 0) return;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (userId) {
    try {
      const { data: existingItems, error: fetchError } = await supabase
        .from('grocery')
        .select('id, ingredient_name, in_cart')
        .eq('user_id', userId)
        .in('ingredient_name', selectedItems)
        .eq('in_cart', false);

      if (fetchError) throw fetchError;

      const existingNames = existingItems?.map(item => item.ingredient_name) || [];
      const toUpdateIds = existingItems?.map(item => item.id) || [];

      if (toUpdateIds.length > 0) {
        const { error: updateError } = await supabase
          .from('grocery')
          .update({ in_cart: true })
          .in('id', toUpdateIds);
        if (updateError) throw updateError;
      }

      const notInGrocery = selectedItems.filter(name => !existingNames.includes(name));
      setIngredientList(prev => prev.filter(ing => !selectedItems.includes(ing)));

      Alert.alert('Items moved to shopping cart', `Moved: ${existingNames.join(', ')}`, [{ text: 'OK' }]);

      if (notInGrocery.length > 0) {
        Alert.alert(
          'Some items were not in your grocery list',
          `${notInGrocery.join(', ')}\n\nWould you like to add them to your shopping cart?`,
          [
            { text: 'No', style: 'cancel', onPress: () => router.push('/grocery') },
            {
              text: 'Yes',
              onPress: async () => {
                const newCartItems = notInGrocery.map(name => ({
                  ingredient_name: name,
                  user_id: userId,
                  in_cart: true,
                  created_at: new Date().toISOString(),
                }));

                let insertedCount = 0;
                let skippedItems: string[] = [];
                let errors: string[] = [];

                for (const item of newCartItems) {
                  const { error: insertError } = await supabase.from('grocery').insert([item]);

                  if (insertError) {
                    if (insertError.code === '23505') {
                      // Duplicate key violation — skip this item
                      skippedItems.push(item.ingredient_name);
                    } else if (insertError.code === '42501') {
                      // RLS violation, warn and skip
                      errors.push(`Permission denied for ${item.ingredient_name}`);
                    } else {
                      errors.push(`Error adding ${item.ingredient_name}: ${insertError.message}`);
                    }
                  } else {
                    insertedCount++;
                  }
                }

                if (insertedCount > 0) {
                  Alert.alert('Success', `Added ${insertedCount} item(s) to your shopping cart.`);
                }
                if (skippedItems.length > 0) {
                  Alert.alert('Skipped Items', `Already in cart: ${skippedItems.join(', ')}`);
                }
                if (errors.length > 0) {
                  Alert.alert('Errors', errors.join('\n'));
                }

                router.push('/grocery');
              },
            },
          ]
        );
      } else {
        router.push('/grocery');
      }

    } catch (error) {
      console.error('❌ Error updating grocery list:', error);
      Alert.alert('Error', 'There was a problem updating your grocery list.');
    }
  } else {
    // Local storage fallback
    try {
      const existingGroceryRaw = await AsyncStorage.getItem('groceryItems');
      const groceryItems = existingGroceryRaw ? JSON.parse(existingGroceryRaw) : [];

      const existingCartRaw = await AsyncStorage.getItem('shoppingCartItems');
      const cartItems = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      const inGroceryNames = groceryItems.filter((item: any) => !item.inCart).map((item: any) => item.name);
      const toRemove = selectedItems.filter(name => inGroceryNames.includes(name));
      const notInGrocery = selectedItems.filter(name => !inGroceryNames.includes(name));

      const updatedGrocery = groceryItems.map((item: any) =>
        toRemove.includes(item.name) ? { ...item, inCart: true } : item
      );

      const newCartEntries = notInGrocery.map(name => ({
        id: `${name}-${Date.now()}`,
        name,
        category: 'Uncategorized',
        inCart: true,
      }));

      const updatedCart = [...cartItems, ...newCartEntries];

      await AsyncStorage.setItem('groceryItems', JSON.stringify(updatedGrocery));
      await AsyncStorage.setItem('shoppingCartItems', JSON.stringify(updatedCart));

      setIngredientList(prev => prev.filter(ing => !selectedItems.includes(ing)));

      Alert.alert('Items moved to shopping cart', `Moved: ${toRemove.join(', ')}`, [{ text: 'OK' }]);

      if (notInGrocery.length > 0) {
        Alert.alert(
          'Some items were not in your grocery list',
          `${notInGrocery.join(', ')}\n\nWould you like to add them to your shopping cart?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                router.push('/grocery');
              },
            },
          ]
        );
      } else {
        router.push('/grocery');
      }
    } catch (err) {
      console.error('❌ Failed to update local storage:', err);
      Alert.alert('Error', 'Failed to update local grocery list.');
    }
  }
};
