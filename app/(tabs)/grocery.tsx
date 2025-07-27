import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import BannerAdComponent from '../components/BannerAdComponent';

// Import new components
import { GroceryTabs } from '../components/GroceryScreenComponents/GroceryTabs';
import { CategorySection } from '../components/GroceryScreenComponents/CategorySection';
import { EmptyState } from '../components/GroceryScreenComponents/EmptyState';
import { AddItemButtons } from '../components/GroceryScreenComponents/AddItemButtons';
import { ManualAddModal } from '../components/GroceryScreenComponents/ManualAddModal';
import { ToastNotification } from '../components/GroceryScreenComponents/ToastNotification';
import { InstructionText } from '../components/GroceryScreenComponents/InstructionText';

import { styles } from '../styles/Grocery.styles';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

export default function GroceryTab() {
  useRequireAuth();

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'needed' | 'cart'>('needed');
  const [showCartToast, setShowCartToast] = useState(false);
  const [showRemovedToast, setShowRemovedToast] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string>('');
  const [lastRemovedItem, setLastRemovedItem] = useState<string>('');
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const navigation = useNavigation();
  const { newIngredients } = useLocalSearchParams();

  // Animation values
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-50)).current;
  const removedToastOpacity = useRef(new Animated.Value(0)).current;
  const removedToastTranslateY = useRef(new Animated.Value(-50)).current;

  // Add debounce mechanism to prevent rapid updates
  const processingItems = useRef(new Set<string>());
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removedToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchGroceryItemsFromDatabase();
    }, [])
  );

  // Handle new ingredients from the ingredients screen
  useEffect(() => {
    async function prepareAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/cooking-bell.wav')
        );

        soundRef.current = sound;
      } catch (error) {
        console.error('Audio setup or loading failed:', error);
      }
    }

    prepareAudio();

    if (newIngredients) {
      try {
        const parsedIngredients = JSON.parse(newIngredients as string);
        addNewIngredientsToGroceryList(parsedIngredients);
      } catch (error) {
        console.error('Error parsing new ingredients:', error);
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [newIngredients]);

  // Utility functions
  const categorizeIngredient = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();

    if (
      lowerIngredient.includes('apple') ||
      lowerIngredient.includes('banana') ||
      lowerIngredient.includes('orange') ||
      lowerIngredient.includes('tomato') ||
      lowerIngredient.includes('onion') ||
      lowerIngredient.includes('carrot') ||
      lowerIngredient.includes('potato') ||
      lowerIngredient.includes('lettuce')
    ) {
      return 'Produce';
    }

    if (
      lowerIngredient.includes('milk') ||
      lowerIngredient.includes('cheese') ||
      lowerIngredient.includes('yogurt') ||
      lowerIngredient.includes('butter')
    ) {
      return 'Dairy';
    }

    if (
      lowerIngredient.includes('chicken') ||
      lowerIngredient.includes('beef') ||
      lowerIngredient.includes('fish') ||
      lowerIngredient.includes('salmon') ||
      lowerIngredient.includes('pork') ||
      lowerIngredient.includes('turkey')
    ) {
      return 'Meat & Seafood';
    }

    if (
      lowerIngredient.includes('rice') ||
      lowerIngredient.includes('pasta') ||
      lowerIngredient.includes('flour') ||
      lowerIngredient.includes('oil') ||
      lowerIngredient.includes('salt') ||
      lowerIngredient.includes('pepper')
    ) {
      return 'Pantry';
    }

    return 'Other';
  };

  const groupItemsByCategory = (items: GroceryItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  };

  // Data fetching
  const fetchGroceryItemsFromDatabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('User not logged in');
      return;
    }

    const { data, error } = await supabase
      .from('grocery')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error fetching grocery items:', error.message);
      return;
    }

    if (data) {
      const formattedItems = data.map((item) => ({
        id: item.id,
        name: item.ingredient_name,
        category: categorizeIngredient(item.ingredient_name),
        needed: true,
        inCart: item.in_cart || false,
      }));

      setItems(formattedItems);
    }
  };

  // Item management functions
  const addNewIngredientsToGroceryList = (ingredients: string[]) => {
    const newItems: GroceryItem[] = ingredients.map((ingredient, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: ingredient,
      category: categorizeIngredient(ingredient),
      needed: true,
      inCart: false,
    }));

    setItems((prevItems) => {
      const existingNames = new Set(
        prevItems.map((item) => item.name.toLowerCase())
      );
      const uniqueNewItems = newItems.filter(
        (item) => !existingNames.has(item.name.toLowerCase())
      );

      if (uniqueNewItems.length > 0) {
        Alert.alert(
          'Items Added',
          `${uniqueNewItems.length} new item${
            uniqueNewItems.length !== 1 ? 's' : ''
          } added to your grocery list!`,
          [{ text: 'OK' }]
        );
      }

      return [...prevItems, ...uniqueNewItems];
    });
  };

  const addManualItem = async () => {
    const trimmedName = newItemName.trim();
    if (trimmedName === '') {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const existingNames = new Set(items.map((item) => item.name.toLowerCase()));
    if (existingNames.has(trimmedName.toLowerCase())) {
      Alert.alert('Item Exists', 'This item is already in your grocery list');
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Unable to fetch user information.');
      console.error('User error:', userError?.message);
      return;
    }

    const { data, error } = await supabase
      .from('grocery')
      .insert([{ ingredient_name: trimmedName, user_id: user.id }])
      .select()
      .single();

    if (error || !data) {
      Alert.alert('Error', 'Failed to add item to the database.');
      console.error('Insert error:', error?.message);
      return;
    }

    const newItem: GroceryItem = {
      id: data.id,
      name: data.ingredient_name,
      category: categorizeIngredient(data.ingredient_name),
      needed: true,
      inCart: false,
    };

    setItems((prevItems) => [...prevItems, newItem]);
    setNewItemName('');
    setShowManualAddModal(false);

    Alert.alert(
      'Item Added',
      `"${newItem.name}" has been added to your grocery list!`
    );
  };

  const removeItem = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('User not logged in');
      return;
    }

    const { error } = await supabase
      .from('grocery')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Failed to delete item:', error.message);
      Alert.alert('Error', 'Failed to remove item from the database.');
      return;
    }

    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Toast functions
  const showAddedToCartToast = useCallback(
    (itemName: string) => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      if (showCartToast) {
        setLastAddedItem(itemName);
        toastTimeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(toastOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(toastTranslateY, {
              toValue: -50,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowCartToast(false);
          });
        }, 2000);
        return;
      }

      setLastAddedItem(itemName);
      setShowCartToast(true);

      toastOpacity.setValue(0);
      toastTranslateY.setValue(-50);

      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      toastTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -50,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowCartToast(false);
        });
      }, 2000);
    },
    [showCartToast, toastOpacity, toastTranslateY]
  );

  const showRemovedFromCartToast = useCallback(
    (itemName: string) => {
      if (removedToastTimeoutRef.current) {
        clearTimeout(removedToastTimeoutRef.current);
      }

      if (showRemovedToast) {
        setLastRemovedItem(itemName);
        removedToastTimeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(removedToastOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(removedToastTranslateY, {
              toValue: -50,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowRemovedToast(false);
          });
        }, 2000);
        return;
      }

      setLastRemovedItem(itemName);
      setShowRemovedToast(true);

      removedToastOpacity.setValue(0);
      removedToastTranslateY.setValue(-50);

      Animated.parallel([
        Animated.timing(removedToastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(removedToastTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      removedToastTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(removedToastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(removedToastTranslateY, {
            toValue: -50,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowRemovedToast(false);
        });
      }, 2000);
    },
    [showRemovedToast, removedToastOpacity, removedToastTranslateY]
  );

  const toggleItemCart = useCallback(
    async (id: string) => {
      if (processingItems.current.has(id)) return;
      processingItems.current.add(id);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not logged in');
        processingItems.current.delete(id);
        return;
      }

      const item = items.find((item) => item.id === id);
      if (!item) {
        processingItems.current.delete(id);
        return;
      }

      const newInCart = !item.inCart;

      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === id ? { ...prevItem, inCart: newInCart } : prevItem
        )
      );

      if (newInCart) {
        playSound();
        showAddedToCartToast(item.name);
      } else {
        showRemovedFromCartToast(item.name);
      }

      const { error } = await supabase
        .from('grocery')
        .update({ in_cart: newInCart })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error(
          '❌ Error updating cart status in database:',
          error.message
        );
      }

      setTimeout(() => {
        processingItems.current.delete(id);
      }, 300);
    },
    [items, showAddedToCartToast, showRemovedFromCartToast]
  );

  const playSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.replayAsync();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  // Navigation functions
  const navigateToCamera = () => {
    navigation.navigate('CameraScreen' as never);
  };

  const navigateToIngredients = () => {
    navigation.navigate('Ingredients' as never);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (removedToastTimeoutRef.current) {
        clearTimeout(removedToastTimeoutRef.current);
      }
    };
  }, []);

  // Computed values
  const neededItems = items.filter((item) => item.needed && !item.inCart);
  const cartItems = items.filter((item) => item.inCart);
  const hasAnyItems = items.length > 0;

  // Render functions
  const renderItemsByCategory = (
    items: GroceryItem[],
    showCheckbox: boolean = true
  ) => {
    const groupedItems = groupItemsByCategory(items);

    return Object.entries(groupedItems).map(([category, categoryItems]) => (
      <CategorySection
        key={category}
        category={category}
        items={categoryItems}
        showCheckbox={showCheckbox}
        onToggleCart={toggleItemCart}
        onRemove={removeItem}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <BannerAdComponent /> */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grocery List</Text>
        <Text style={styles.headerSubtitle}>
          Smart suggestions based on your fridge
        </Text>
      </View>

      {hasAnyItems && (
        <GroceryTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          neededCount={neededItems.length}
          cartCount={cartItems.length}
        />
      )}

      {/* Instruction text */}
      {hasAnyItems && selectedTab === 'needed' && neededItems.length > 0 && (
        <InstructionText type="needed" />
      )}

      {hasAnyItems && selectedTab === 'cart' && cartItems.length > 0 && (
        <InstructionText type="cart" />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasAnyItems ? (
          <EmptyState
            type="initial"
            onCameraPress={navigateToCamera}
            onIngredientsPress={navigateToIngredients}
            onManualAddPress={() => setShowManualAddModal(true)}
          />
        ) : selectedTab === 'needed' ? (
          <>
            {neededItems.length > 0 ? (
              renderItemsByCategory(neededItems, true)
            ) : (
              <EmptyState
                type="needed"
                onCameraPress={navigateToCamera}
                onIngredientsPress={navigateToIngredients}
                onManualAddPress={() => setShowManualAddModal(true)}
              />
            )}
          </>
        ) : (
          <>
            {cartItems.length > 0 ? (
              renderItemsByCategory(cartItems, true)
            ) : (
              <EmptyState
                type="cart"
                onCameraPress={navigateToCamera}
                onIngredientsPress={navigateToIngredients}
                onManualAddPress={() => setShowManualAddModal(true)}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Add Item Buttons */}
      {hasAnyItems && (
        <AddItemButtons
          onCameraPress={navigateToCamera}
          onManualAddPress={() => setShowManualAddModal(true)}
        />
      )}

      {/* Manual Add Item Modal */}
      <ManualAddModal
        visible={showManualAddModal}
        newItemName={newItemName}
        onClose={() => setShowManualAddModal(false)}
        onItemNameChange={setNewItemName}
        onAddItem={addManualItem}
      />

      {/* Toast Notifications */}
      <ToastNotification
        visible={showCartToast}
        type="added"
        itemName={lastAddedItem}
        opacity={toastOpacity}
        translateY={toastTranslateY}
      />

      <ToastNotification
        visible={showRemovedToast}
        type="removed"
        itemName={lastRemovedItem}
        opacity={removedToastOpacity}
        translateY={removedToastTranslateY}
      />
    </SafeAreaView>
  );
}
