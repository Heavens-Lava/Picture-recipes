import 'dotenv/config';

export default {
  expo: {
    name: 'picture-recipes-app',
    slug: 'picture-recipes-app',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icons/picture-recipes-icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    android: {
      permissions: ['CAMERA'], 
      package: 'com.jeffreymacy.picturerecipesapp',
    },
    ios: {
      infoPlist: {
        NSCameraUsageDescription: 'We need your permission to access the camera',
      },
      supportsTablet: true,
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router', 'expo-font', 'expo-web-browser'],
    experiments: {
      typedRoutes: true,
    },
    newArchEnabled: true,
    extra: {
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '2af9d2cd-4cde-46a0-b54e-e1a3b0729b20',
      },
    },
  },
};
