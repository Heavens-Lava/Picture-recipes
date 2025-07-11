import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Router } from 'expo-router';

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
    const newItems = selectedItems.map(name => ({
      ingredient_name: name,
      user_id: userId,
      in_cart: false,
    }));
    const { error } = await supabase.from('grocery').insert(newItems);
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    success = true;
  } else {
    try {
      const existing = await AsyncStorage.getItem('groceryItems');
      const parsed = existing ? JSON.parse(existing) : [];

      const updated = [
        ...parsed,
        ...selectedItems.map(name => ({
          id: `${name}-${Date.now()}`,
          name,
          category: 'Uncategorized',
          needed: true,
          inCart: false,
        })),
      ];

      await AsyncStorage.setItem('groceryItems', JSON.stringify(updated));
      success = true;
    } catch (err) {
      console.error('❌ Failed to save to local storage:', err);
      return;
    }
  }

  if (success) {
    setIngredientList(prev => prev.filter(ing => !selectedIngredients.has(ing)));
    router.push('/grocery');
  }
};
