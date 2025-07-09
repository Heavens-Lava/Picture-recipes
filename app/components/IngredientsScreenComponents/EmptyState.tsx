import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from '../../styles/Ingredients.styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export const EmptyState: React.FC = () => {
  const router = useRouter();
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <AnimatedIcon
          name="fridge-outline"
          size={72}
          color="#10B981" // fresh emerald green
          style={animatedStyle}
        />
        <Text style={[styles.title, { color: '#047857' }]}>No ingredients detected</Text>
        <Text style={[styles.subtitle, { color: '#065F46' }]}>
          {"Please take a photo of your fridge\nor pantry to get started."}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/CameraScreen')}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
