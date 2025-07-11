import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import type { ParsedRecipe } from '../CameraScreenComponents/AIResponseParser';

export const useParsedParams = () => {
  const { ingredients, recipes, detailedRecipes } = useLocalSearchParams<{
    ingredients?: string | string[];
    recipes?: string | string[];
    detailedRecipes?: string;
  }>();

  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeList, setRecipeList] = useState<string[]>([]);
  const [parsedDetailedRecipes, setParsedDetailedRecipes] = useState<ParsedRecipe[]>([]);

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
        console.log('✅ Parsed detailedRecipes:', parsed);
      } catch (err) {
        console.error('❌ Failed to parse detailedRecipes:', err);
      }
    }
  }, [ingredients, recipes, detailedRecipes]);

  return { ingredientList, recipeList, parsedDetailedRecipes, setIngredientList };
};
