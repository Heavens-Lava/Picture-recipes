import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.SUPABASE_ANON_KEY;

// ✅ Configure Supabase with AsyncStorage for persistent login
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// ✅ Main function used in index.tsx to save a recipe
export const saveRecipeToSupabase = async (recipe: {
  title: string;
  ingredients: string[];
  instructions?: string;
}) => {
  try {
    // Check if the recipe already exists
    const { data: existingRecipe, error: checkRecipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('recipe_name', recipe.title)
      .single();

    if (checkRecipeError && checkRecipeError.code !== 'PGRST116') {
      console.error('Error checking for existing recipe:', checkRecipeError.message);
      return;
    }

    if (existingRecipe) {
      console.log('Recipe already exists:', recipe.title);
      return;
    }

    // Insert new recipe
    const { data: recipeData, error: insertRecipeError } = await supabase
      .from('recipes')
      .insert({
        recipe_name: recipe.title,
        title: recipe.title,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: recipe.instructions ?? '',
      })
      .single();

    if (insertRecipeError) {
      console.error('Error saving recipe:', insertRecipeError.message);
      return;
    }

    console.log('✅ Recipe saved:', recipe.title);

    // Insert and link ingredients
    if (recipeData) {
      for (const ingredient of recipe.ingredients) {
        // Check if ingredient exists
        const { data: existingIngredient, error: checkIngredientError } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredient)
          .single();

        if (checkIngredientError && checkIngredientError.code !== 'PGRST116') {
          console.error('Error checking ingredient:', checkIngredientError.message);
          continue;
        }

        let ingredientId;

        if (!existingIngredient) {
          // Insert ingredient
          const { data: newIngredient, error: insertIngredientError } = await supabase
            .from('ingredients')
            .insert({
              name: ingredient,
              quantity: '',
              unit: '',
              created_at: new Date(),
            })
            .single();

          if (insertIngredientError) {
            console.error('Error inserting ingredient:', insertIngredientError.message);
            continue;
          }

          ingredientId = newIngredient.id;
        } else {
          ingredientId = existingIngredient.id;
        }

        // Link recipe to ingredient
        const { error: linkError } = await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: recipeData.id,
            ingredient_id: ingredientId,
          });

        if (linkError) {
          console.error('Error linking ingredient to recipe:', linkError.message);
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error in saveRecipeToSupabase:', err);
  }
};
