import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

import BackHeader from '../components/InstructionsScreenComponents/BackHeader';
import RecipeHeader from '../components/InstructionsScreenComponents/RecipeHeader';
import IngredientsSection from '../components/InstructionsScreenComponents/IngredientsSection';
import ToolsSection from '../components/InstructionsScreenComponents/ToolsSection';
import InstructionsSection from '../components/InstructionsScreenComponents/InstructionsSection';
import { parseInstructions } from '../components/InstructionsScreenComponents/InstructionParser';
import { Recipe } from '../components/InstructionsScreenComponents/types';

export default function InstructionsScreen() {
  const params = useLocalSearchParams();
  const recipe: Recipe = JSON.parse(params.recipe as string);

  const [tried, setTried] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const { ingredients: aiIngredients, tools, steps } = parseInstructions(recipe.instructions || '');
  const displayIngredients = recipe.ingredients || aiIngredients;

  const handleRecipeTried = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        Alert.alert('Error', 'You must be logged in to track recipes tried.');
        return;
      }

      const userId = session.user.id;

      const { error } = await supabase.rpc('increment_recipes_tried', {
        user_id_input: userId,
      });

      if (error) {
        console.error('❌ Error updating recipes_tried:', error);
        Alert.alert('Error', 'Could not update your tried recipes count.');
      } else {
        setTried(true);
        Alert.alert('Awesome', 'Thanks for trying this recipe!');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handleRatingSubmit = async (selectedRating: number) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ rating: selectedRating })
        .eq('id', recipe.id);

      if (error) {
        console.error('❌ Error submitting rating:', error);
        Alert.alert('Error', 'Could not submit rating.');
        return;
      }

      setRating(selectedRating);
      setRatingSubmitted(true);
      Alert.alert('Thank you!', 'Your rating has been submitted.');
    } catch (err) {
      console.error('❌ Rating error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingSubmit(i)}
          disabled={ratingSubmitted}
        >
          <FontAwesome
            name={i <= (rating ?? 0) ? 'star' : 'star-o'}
            size={32}
            color={ratingSubmitted ? '#f59e0b' : '#fbbf24'}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.starRow}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RecipeHeader
          title={recipe.recipe_name}
          imageUrl={recipe.meal_image_url || recipe.image_url}
          cookTime={recipe.cookTime}
          servings={recipe.servings}
          difficulty={recipe.difficulty}
        />

        <IngredientsSection ingredients={displayIngredients} />
        <ToolsSection tools={tools} />
        <InstructionsSection steps={steps} />

        <TouchableOpacity
          style={[styles.triedButton, tried && styles.triedButtonDisabled]}
          onPress={handleRecipeTried}
          disabled={tried}
        >
          <Text style={styles.triedButtonText}>
            {tried ? 'Awesome! Thanks for trying this recipe!' : 'Did you try this recipe?'}
          </Text>
        </TouchableOpacity>

        {tried && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingPrompt}>
              {ratingSubmitted ? 'You rated this recipe:' : 'How would you rate this recipe?'}
            </Text>
            {renderStars()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  triedButton: {
    marginTop: 30,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  triedButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  triedButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  ratingSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  ratingPrompt: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#374151',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    marginHorizontal: 6,
  },
});
