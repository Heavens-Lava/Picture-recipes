import { useState } from 'react';
import { Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { saveRecipeToSupabase, getUserProfile, getUserRecipeCount } from '../../lib/supabaseFunctions';
import {
  extractRecipeIngredients,
  parseRecipeString,
} from '../../lib/filteringFunctions';
import openai from '../../lib/openai';
import { generateRecipeImage } from '../../lib/generateImage';
import type { ParsedRecipe } from '../CameraScreenComponents/AIResponseParser';
import { supabase } from '../../lib/supabase';

import { Alert } from 'react-native'; // Make sure this is at the top
interface UseIngredientsLogicProps {
  detailedRecipes?: ParsedRecipe[];
}

export const useIngredientsLogic = ({ detailedRecipes = [] }: UseIngredientsLogicProps = {}) => {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [removedRecipes, setRemovedRecipes] = useState<Set<string>>(new Set());
  const [recipeAnimations] = useState<Map<string, Animated.Value>>(() => new Map());

  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    if (param === undefined || param === null) return [];
    if (Array.isArray(param)) {
      return param.map(item => String(item).trim()).filter(item => item.length > 0);
    }
    if (typeof param === 'string') {
      try {
        const parsed = JSON.parse(param);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(item => item.length > 0);
        }
      } catch {
        return param.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
    }
    return [];
  };

  const getOrCreateAnimation = (recipe: string): Animated.Value => {
    if (!recipeAnimations.has(recipe)) {
      recipeAnimations.set(recipe, new Animated.Value(1));
    }
    return recipeAnimations.get(recipe)!;
  };

  const animateRecipeRemoval = (recipe: string) => {
    const animation = getOrCreateAnimation(recipe);
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setRemovedRecipes(prev => new Set([...prev, recipe]));
    });
  };

  const generateInstructions = async (recipeName: string, ingredients: string[]): Promise<string> => {
    try {
      const prompt = `Create clear, beginner-friendly cooking instructions for a recipe called "${recipeName}" using the following ingredients:\n\n${ingredients.join(', ')}.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch {
      return 'Instructions will be generated when you view the recipe.';
    }
  };

  const handleAddRecipe = async (recipesToAdd: string[], allFridgeIngredients: string[]) => {
    if (isSaving) return;

    setIsSaving(true);
    let successCount = 0;

    try {
      const profile = await getUserProfile();
      const recipeCount = await getUserRecipeCount();

      if (!profile) return;

      const isPremium = profile.has_premium;
      const recipeLimit = 5;

      for (const recipe of recipesToAdd) {
        if (!isPremium && recipeCount + successCount >= recipeLimit) {
          break;
        }

        try {
          const detailedRecipe = detailedRecipes.find(
            (d) => d.name.toLowerCase() === recipe.toLowerCase()
          );

          const relevantIngredients = detailedRecipe?.availableIngredients?.length
            ? detailedRecipe.availableIngredients
            : extractRecipeIngredients(recipe, allFridgeIngredients);

          const { recipeName } = parseRecipeString(recipe);
          const instructions = await generateInstructions(recipeName, relevantIngredients);

          let imageUrl = detailedRecipe?.image || null;
          if (!imageUrl) {
            imageUrl = await generateRecipeImage(recipeName);
          }

          const recipeData = {
            title: recipeName,
            recipe_name: recipeName,
            ingredients: relevantIngredients,
            instructions,
            image: imageUrl,
            cookTime: '15-30 min',
            servings: 2,
            difficulty: 'Easy',
            rating: null,
            availableIngredients: relevantIngredients.length,
            totalIngredients: relevantIngredients.length,
            created_at: new Date().toISOString(),
          };

          const result = await saveRecipeToSupabase(recipeData);

          if (result) {
            animateRecipeRemoval(recipe);
            successCount++;
          }
        } catch {
          // silently ignore errors per recipe
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Adds selected ingredients to grocery list without errors or alerts.
   * Silently skips duplicates by pre-checking existing items.
   */
const handleAddIngredientsToGroceryList = async (userId: string, ingredients: string[]) => {
  try {
    const { data: existingItems, error: fetchError } = await supabase
      .from('grocery')
      .select('ingredient_name')
      .eq('user_id', userId);

    if (fetchError) {
      Alert.alert('Error', 'Could not fetch existing grocery items.');
      return { inserted: [], skipped: ingredients };
    }

    const existingNames = existingItems?.map(item => item.ingredient_name) ?? [];
    const newItems = ingredients.filter(name => !existingNames.includes(name));

    if (newItems.length === 0) {
      Alert.alert('No New Items', 'All selected ingredients are already in your grocery list.');
      return { inserted: [], skipped: ingredients };
    }

    const insertPayload = newItems.map(name => ({
      user_id: userId,
      ingredient_name: name,
      in_cart: false,
      added_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from('grocery').insert(insertPayload);

    if (insertError) {
      Alert.alert('Error', 'There was an issue adding some ingredients. Please try again.');
      return { inserted: [], skipped: newItems };
    }

    // 🎉 Show alert summary
    const addedText = newItems.join(', ');
    const skipped = ingredients.filter(n => existingNames.includes(n));
    const skippedText = skipped.length > 0 ? `\n\nAlready in list: ${skipped.join(', ')}` : '';

    Alert.alert('Grocery List Updated', `Added: ${addedText}${skippedText}`);

    return { inserted: newItems, skipped };
  } catch {
    Alert.alert('Error', 'Unexpected issue adding to your grocery list.');
    return { inserted: [], skipped: ingredients };
  }
};

  return {
    isSaving,
    removedRecipes,
    parseArrayParam,
    getOrCreateAnimation,
    handleAddRecipe,
    handleAddIngredientsToGroceryList,
  };
};
