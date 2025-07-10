import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingCart, CheckSquare } from 'lucide-react-native';

import { IngredientsDisplayWithSelection } from '../components/IngredientsScreenComponents/IngredientsDisplayWithSelection';
import { RecipeSuggestions } from '../components/IngredientsScreenComponents/RecipeSuggestions';
import { EmptyState } from '../components/IngredientsScreenComponents/EmptyState';
import { BottomActions } from '../components/IngredientsScreenComponents/BottomActions';
import { useIngredientsLogic } from '../components/IngredientsScreenComponents/useIngredientsLogic';

import type { ParsedRecipe } from '../components/CameraScreenComponents/AIResponseParser';
import styles from '../styles/Ingredients.styles';

import { saveIngredientsToGrocery, moveIngredientsToShoppingCart } from '../services/groceryService';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Alert } from 'react-native'; // make sure to import Alert at the top of your file


interface IngredientsScreenParams {
  ingredients?: string | string[];
  recipes?: string | string[];
  photoUri?: string;
  generatedImageUrl?: string;
  savedId?: string;
  detailedRecipes?: string; // JSON string of ParsedRecipe[]
}

export default function IngredientsScreen() {
      useRequireAuth(); // Ensure the user is authenticated before accessing this screen
  
  const router = useRouter();
  const { ingredients, recipes, detailedRecipes } = useLocalSearchParams<IngredientsScreenParams>();

  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeList, setRecipeList] = useState<string[]>([]);
  const [parsedDetailedRecipes, setParsedDetailedRecipes] = useState<ParsedRecipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

  useEffect(() => {
    const parseArrayParam = (param: string | string[] | undefined): string[] => {
      if (!param) return [];
      if (Array.isArray(param)) return param.map(item => String(item).trim()).filter(Boolean);
      try {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed)) return parsed.map(item => String(item).trim()).filter(Boolean);
      } catch {}
      return param.split(',').map(item => item.trim()).filter(Boolean);
    };

    setIngredientList(parseArrayParam(ingredients));
    setRecipeList(parseArrayParam(recipes));

    if (typeof detailedRecipes === 'string') {
      try {
        const parsed = JSON.parse(detailedRecipes);
        setParsedDetailedRecipes(parsed);
        console.log('✅ Parsed detailedRecipes in IngredientsScreen:', parsed);
      } catch (err) {
        console.error('❌ Failed to parse detailedRecipes:', err);
      }
    }
  }, [ingredients, recipes, detailedRecipes]);

  const {
    isSaving,
    removedRecipes,
    getOrCreateAnimation,
    handleAddRecipe,
  } = useIngredientsLogic({ detailedRecipes: parsedDetailedRecipes });

  const handleToggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      newSet.has(ingredient) ? newSet.delete(ingredient) : newSet.add(ingredient);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allSelected = selectedIngredients.size === ingredientList.length;
    setSelectedIngredients(allSelected ? new Set() : new Set(ingredientList));
  };

const handleRemoveFromGrocery = async () => {
  const selectedItems = Array.from(selectedIngredients);
  if (selectedItems.length === 0) return;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (userId) {
    try {
      // 1) Fetch grocery items for user that match selected names and in_cart is false
      const { data: existingItems, error: fetchError } = await supabase
        .from('grocery')
        .select('id, ingredient_name, in_cart')
        .eq('user_id', userId)
        .in('ingredient_name', selectedItems)
        .eq('in_cart', false);

      if (fetchError) throw fetchError;

      const existingNames = existingItems?.map(item => item.ingredient_name) || [];
      const toUpdateIds = existingItems?.map(item => item.id) || [];

      // 2) Update existing items to in_cart = true
      if (toUpdateIds.length > 0) {
        const { error: updateError } = await supabase
          .from('grocery')
          .update({ in_cart: true })
          .in('id', toUpdateIds);

        if (updateError) throw updateError;
      }

      // 3) Identify selected items not in grocery or already in cart
      const notInGrocery = selectedItems.filter(name => !existingNames.includes(name));

      // 4) Update local state by removing selected items
      setIngredientList(prev => prev.filter(ing => !selectedItems.includes(ing)));
      setSelectedIngredients(new Set());

      // 5) Notify user about success for moved items
      Alert.alert(
        'Items moved to shopping cart',
        `Moved: ${existingNames.join(', ')}`,
        [{ text: 'OK' }]
      );

      // 6) Prompt to add missing items to shopping cart if any
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
                }));

                const { error: insertError } = await supabase
                  .from('grocery')
                  .insert(newCartItems);

                if (insertError) {
                  Alert.alert('Error', 'Failed to add items to shopping cart.');
                } else {
                  Alert.alert('Success', 'Items added to your shopping cart.');
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
    // Handle local storage case (non-authenticated user)
    try {
      const existingGroceryRaw = await AsyncStorage.getItem('groceryItems');
      const groceryItems = existingGroceryRaw ? JSON.parse(existingGroceryRaw) : [];

      const existingCartRaw = await AsyncStorage.getItem('shoppingCartItems');
      const cartItems = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      // Items currently in grocery list (inCart false)
      const inGroceryNames = groceryItems
        .filter((item: any) => !item.inCart)
        .map((item: any) => item.name);

      // Items to remove from grocery (those in grocery list)
      const toRemoveFromGrocery = selectedItems.filter(name => inGroceryNames.includes(name));
      // Items not in grocery list
      const notInGrocery = selectedItems.filter(name => !inGroceryNames.includes(name));

      // Update groceryItems: mark inCart true for those toRemoveFromGrocery
      const updatedGrocery = groceryItems.map((item: any) =>
        toRemoveFromGrocery.includes(item.name) ? { ...item, inCart: true } : item
      );

      // Update shopping cart by adding toRemoveFromGrocery that may not be in cart yet
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
      setSelectedIngredients(new Set());

      Alert.alert(
        'Items moved to shopping cart',
        `Moved: ${toRemoveFromGrocery.join(', ')}`,
        [{ text: 'OK' }]
      );

      if (notInGrocery.length > 0) {
        Alert.alert(
          'Some items were not in your grocery list',
          `${notInGrocery.join(', ')}\n\nWould you like to add them to your shopping cart?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                // Items already added to cart above, just navigate
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

  const handleNavigateToGrocery = async () => {
    const selectedItems = Array.from(selectedIngredients);
    if (selectedItems.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    let success = false;

    if (userId) {
      const result = await saveIngredientsToGrocery(userId, selectedItems);
      if (result.error) return console.error('❌ Supabase error:', result.error);
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
      setSelectedIngredients(new Set());
      router.push('/grocery');
    }
  };

  if (!ingredientList || ingredientList.length === 0) return <EmptyState />;

  const visibleRecipes = recipeList.filter(recipe => !removedRecipes.has(recipe));
  const selectedCount = selectedIngredients.size;
  const allSelected = selectedCount === ingredientList.length && ingredientList.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <IngredientsDisplayWithSelection
          ingredients={ingredientList}
          selectedIngredients={selectedIngredients}
          onToggleIngredient={handleToggleIngredient}
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
        />

        {selectedCount > 0 && (
          <View style={{ marginBottom: 32 }}>
            <TouchableOpacity
              style={groceryButtonStyles.button}
              onPress={handleNavigateToGrocery}
            >
              <ShoppingCart size={20} color="#FFFFFF" />
              <Text style={groceryButtonStyles.buttonText}>
                Add {selectedCount} to Grocery List
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[groceryButtonStyles.button, { backgroundColor: '#DC2626', marginTop: 12 }]}
              onPress={handleRemoveFromGrocery}
            >
              <CheckSquare size={20} color="#FFFFFF" />
              <Text style={groceryButtonStyles.buttonText}>
                Remove {selectedCount} from Grocery (Adds to Cart)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <RecipeSuggestions
          recipes={recipeList}
          visibleRecipes={visibleRecipes}
          ingredientList={ingredientList}
          removedRecipes={removedRecipes}
          getOrCreateAnimation={getOrCreateAnimation}
          onAddRecipe={(recipe) => handleAddRecipe(recipe, ingredientList)}
          isSaving={isSaving}
          detailedRecipes={parsedDetailedRecipes}
        />

        <BottomActions />
      </ScrollView>
    </SafeAreaView>
  );
}

const groceryButtonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
