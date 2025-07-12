import React from 'react';
import { ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { IngredientsDisplayWithSelection } from '../components/IngredientsScreenComponents/IngredientsDisplayWithSelection';
import { RecipeSuggestions } from '../components/IngredientsScreenComponents/RecipeSuggestions';
import { EmptyState } from '../components/IngredientsScreenComponents/EmptyState';
import { BottomActions } from '../components/IngredientsScreenComponents/BottomActions';
import { GroceryActionButtons } from '../components/IngredientsScreenComponents/GroceryActionButtons';

import { useParsedParams } from '../components/IngredientsScreenComponents/useParsedParams';
import { useIngredientSelection } from '../components/IngredientsScreenComponents/useIngredientSelection';
import { useIngredientsLogic } from '../components/IngredientsScreenComponents/useIngredientsLogic';

import styles from '../styles/Ingredients.styles';
import { handleRemoveFromGrocery } from '../components/IngredientsScreenComponents/handleRemoveFromGrocery';
import { supabase } from '../lib/supabase';

export default function IngredientsScreen() {
  const router = useRouter();
  const { ingredientList, recipeList, parsedDetailedRecipes, setIngredientList } = useParsedParams();
  const { selectedIngredients, handleToggleIngredient, handleSelectAll } = useIngredientSelection(ingredientList);
  const { isSaving, removedRecipes, getOrCreateAnimation, handleAddRecipe, handleAddIngredientsToGroceryList } = useIngredientsLogic({ detailedRecipes: parsedDetailedRecipes });

  if (!ingredientList || ingredientList.length === 0) return <EmptyState />;

  const selectedCount = selectedIngredients.size;
  const allSelected = selectedCount === ingredientList.length;
  const visibleRecipes = recipeList.filter(recipe => !removedRecipes.has(recipe));

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

        <GroceryActionButtons
          selectedCount={selectedCount}
          onAdd={async () => {
            try {
              console.log('Attempting to add ingredients to grocery list...');
              const user = await supabase.auth.getUser();
              const userId = user.data.user?.id;
              console.log('User ID:', userId);

              if (!userId) {
                Alert.alert('Error', 'You must be logged in to add to your grocery list.');
                console.warn('Add to grocery list blocked: User not logged in.');
                return;
              }

              const selectedItems = Array.from(selectedIngredients);
              console.log('Selected items to add:', selectedItems);

              const { inserted, skipped } = await handleAddIngredientsToGroceryList(userId, selectedItems);

              console.log('Inserted items:', inserted);
              console.log('Skipped items:', skipped);

              if (inserted.length === 0 && skipped.length > 0) {
                Alert.alert('No Items Added', `Items may already exist or were blocked: ${skipped.join(', ')}`);
              }

              setIngredientList((prev) => prev.filter((item) => !selectedIngredients.has(item)));

              console.log('Ingredient list updated after adding items.');
            } catch (error) {
              console.error('Error in onAdd handler:', error);
              Alert.alert('Error', 'An unexpected error occurred while adding items.');
            }
          }}
          onRemove={() => handleRemoveFromGrocery(selectedIngredients, setIngredientList, router)}
        />

        <RecipeSuggestions
          recipes={recipeList}
          visibleRecipes={visibleRecipes}
          ingredientList={ingredientList}
          removedRecipes={removedRecipes}
          getOrCreateAnimation={getOrCreateAnimation}
          onAddRecipe={(recipe) => handleAddRecipe([recipe], ingredientList)}
          isSaving={isSaving}
          detailedRecipes={parsedDetailedRecipes}
        />

        <BottomActions />
      </ScrollView>
    </SafeAreaView>
  );
}
