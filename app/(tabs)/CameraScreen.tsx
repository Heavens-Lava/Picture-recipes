import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/CameraScreen.styles';

import CameraControls from '../components/CameraScreenComponents/CameraControls';
import CameraViewComponent from '../components/CameraScreenComponents/CameraViewComponent';
import LocationToggle from '../components/CameraScreenComponents/LocationToggle';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useCameraLogic } from '../components/CameraScreenComponents/useCameraLogic';

export default function CameraScreen() {
  useRequireAuth();
  const {
    facing,
    lastPhoto,
    isAnalyzing,
    ingredients,
    recipes,
    detailedRecipes,
    location,
    cameraRef,
    toggleCameraFacing,
    takePicture,
    toggleLocation,
    handleAIAction,
  } = useCameraLogic();

  const navigation = useNavigation();

  const navigateToIngredients = () => {
    console.log('When navigating to ingredients: Ingredients array:', ingredients);
    console.log('When navigating to ingredients: Recipes array:', recipes);
    console.log('When navigating to ingredients: Last photo:', lastPhoto);

    const ingredientsParam = JSON.stringify(ingredients);
    const recipesParam = JSON.stringify(recipes);

    navigation.navigate('Ingredients', {
      ingredients: ingredientsParam,
      recipes: recipesParam,
      photoUri: lastPhoto?.uri || undefined,
      detailedRecipes: JSON.stringify(detailedRecipes),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {`Scan Your ${location.charAt(0).toUpperCase() + location.slice(1)} 📸`}
        </Text>
        <Text style={styles.headerSubtitle}>
          Take a photo of your {location} to discover recipe ideas
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* New wrapper for camera + buttons */}
        <View style={styles.cameraWithControlsContainer}>
          <CameraViewComponent
            cameraRef={cameraRef}
            facing={facing}
            lastPhoto={lastPhoto}
            isAnalyzing={isAnalyzing}
            styles={styles}
          />
          {/* Overlay controls on top of camera */}
          <View style={styles.cameraControlsOverlay}>
            <CameraControls
              isAnalyzing={isAnalyzing}
              onFlipCamera={toggleCameraFacing}
              onTakePicture={takePicture}
              onAIAction={handleAIAction}
              styles={styles}
            />
          </View>
        </View>

        <LocationToggle
          location={location}
          onToggle={toggleLocation}
          styles={styles}
        />

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <Text style={styles.tipItem}>• Take a photo of your fridge or pantry to detect ingredients.</Text>
          <Text style={styles.tipItem}>• Tap the ✨ star button to re-analyze the photo if needed.</Text>
          <Text style={styles.tipItem}>• From the Ingredients screen, you can:</Text>
          <Text style={styles.tipSubItem}>– Add recipes to your saved list</Text>
          <Text style={styles.tipSubItem}>– Add ingredients to your grocery list</Text>
          <Text style={styles.tipSubItem}>– Remove items already in your cart</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
