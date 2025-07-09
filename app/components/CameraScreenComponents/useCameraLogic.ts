// useCameraLogic.ts - Custom Hook for Camera Business Logic
import { useState, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import openai from '../../lib/openai';
// Removed saveRecipeToSupabase import because we no longer save here
import { parseAIResponse } from './AIResponseParser';
import type { ParsedRecipe } from './AIResponseParser';
import { useNavigation } from '@react-navigation/native'; // ← Add this line
import { incrementPhotosTaken } from '../../lib/userStats';
import { supabase } from '../../lib/supabase'; // Make sure this is imported too



export const useCameraLogic = () => {
    const navigation = useNavigation(); // ← Add this inside the hook
  // State management
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<string[]>([]);
  const [location, setLocation] = useState<'fridge' | 'pantry'>('fridge');
  const cameraRef = useRef<CameraView>(null);
  const [detailedRecipes, setDetailedRecipes] = useState<ParsedRecipe[]>([]);

  // Trigger haptic feedback for camera actions
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Switch between front and back camera
  const toggleCameraFacing = () => {
    triggerHaptic();
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Analyze the taken photo using OpenAI GPT-4
  const analyzePhoto = async (photo: { uri: string; base64?: string }) => {
    setIsAnalyzing(true);

    try {
      const base64Image = `data:image/jpeg;base64,${photo.base64}`;

      
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (userId) {
      await incrementPhotosTaken(userId); // ← track activity
    }



      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a culinary expert analyzing ${location} contents. Your task is to:
1. Identify ALL visible ingredients in the photo
2. Suggest 3-5 practical recipes using ONLY those ingredients
3. For each recipe, specify exactly which visible ingredients are needed

Respond in this EXACT format:

INGREDIENTS FOUND:
• [ingredient 1]
• [ingredient 2] 
• [ingredient 3]
• [etc...]

RECIPES:
• [Recipe Name 1]
  Available ingredients: [ingredient A, ingredient B, ingredient C]
  Additional needed: [any common pantry items if necessary]

• [Recipe Name 2]
  Available ingredients: [ingredient D, ingredient E, ingredient F]
  Additional needed: [any common pantry items if necessary]

• [Recipe Name 3]
  Available ingredients: [ingredient G, ingredient H]
  Additional needed: [any common pantry items if necessary]

Be specific about ingredient names and focus on recipes that maximize the use of visible ingredients. Only suggest additional pantry staples if absolutely necessary (salt, pepper, oil, etc.).`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze my ${location} photo. What ingredients do you see? Then suggest recipes using primarily these visible ingredients, and tell me exactly which ingredients from the photo each recipe uses.` },
              {
                type: 'image_url',
                image_url: { url: base64Image },
              },
            ],
          },
        ],
      });

      const aiText = response.choices[0]?.message?.content ?? '';

      // Log the AI response
      console.log('=== AI RESPONSE ===');
      console.log('Full OpenAI Response:', aiText);
      console.log('=== END AI RESPONSE ===');

      Alert.alert('AI Response', aiText);

      // Parse the response using the parser component
      const {
        ingredients: ingredientsList,
        recipes: recipesList,
        detailedRecipes: parsedDetails,
      } = parseAIResponse(aiText);

      // Ensure ingredients is always an array (never null/undefined)
      const validIngredients = Array.isArray(ingredientsList) ? ingredientsList : [];
      const validRecipes = Array.isArray(recipesList) ? recipesList : [];

      setIngredients(validIngredients);
      setRecipes(validRecipes);
      setDetailedRecipes(parsedDetails || []);

      // Log parsed data for debugging
      console.log('=== VALIDATED DATA ===');
      console.log('Ingredients:', validIngredients);
      console.log('Recipes:', validRecipes);
      console.log('Detailed Recipes:', parsedDetails);
      console.log('=== END VALIDATED DATA ===');

      // After alert, navigate with parsed data
      Alert.alert('AI Response', aiText, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Ingredients', {
              ingredients: JSON.stringify(validIngredients),
              recipes: JSON.stringify(validRecipes),
              detailedRecipes: JSON.stringify(parsedDetails),
              photoUri: photo.uri,
            });
          },
        },
      ]);



    } catch (err) {
      Alert.alert('Error', 'AI or Supabase request failed.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Take a photo using the camera
  const takePicture = async () => {
    if (!cameraRef.current) return;
    triggerHaptic();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (photo?.uri && photo?.base64) {
        setLastPhoto(photo.uri);
        await analyzePhoto(photo);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture.');
      console.error(error);
    }
  };

  // Toggle between 'fridge' and 'pantry' locations
  const toggleLocation = () => {
    setLocation((prevLocation) => (prevLocation === 'fridge' ? 'pantry' : 'fridge'));
  };

  // Handle AI button action (triggers picture and analysis)
  const handleAIAction = async () => {
    if (isAnalyzing) return;

    try {
      triggerHaptic();
      await takePicture(); // capture + analyze
    } catch (err) {
      console.error('Error in AI Action:', err);
    }
  };

  // Return all state and functions needed by the UI
  return {
    // State
    facing,
    permission,
    requestPermission,
    lastPhoto,
    isAnalyzing,
    ingredients,
    recipes,
    detailedRecipes,
    location,
    cameraRef,

    // Functions
    toggleCameraFacing,
    takePicture,
    toggleLocation,
    handleAIAction,
  };
};
