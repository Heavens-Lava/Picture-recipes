import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
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
import { handleNavigateToGrocery } from '../components/IngredientsScreenComponents/handleNavigateToGrocery';

export default function IngredientsScreen() {
  const router = useRouter();
  const { ingredientList, recipeList, parsedDetailedRecipes, setIngredientList } = useParsedParams();
  const { selectedIngredients, handleToggleIngredient, handleSelectAll } = useIngredientSelection(ingredientList);
  const { isSaving, removedRecipes, getOrCreateAnimation, handleAddRecipe } = useIngredientsLogic({ detailedRecipes: parsedDetailedRecipes });

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
          onAdd={() => handleNavigateToGrocery(selectedIngredients, setIngredientList, router)}
          onRemove={() => handleRemoveFromGrocery(selectedIngredients, setIngredientList, router)}
        />

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
