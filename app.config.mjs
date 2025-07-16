import 'dotenv/config';

export default {
  expo: {
    name: 'picture-recipes-app2',
    slug: 'picture-recipes-app2',
    version: '1.0.2',
    orientation: 'portrait',
    scheme: 'picture-recipes-app2',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    android: {
      package: 'com.jeffreymacy.picturerecipesapp', // ← from your config
      permissions: ['CAMERA'],
      compileSdkVersion: 33,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        googleMobileAdsAppId: process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
      },
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          'We need your permission to access the camera',
        NSUserTrackingUsageDescription:
          'This identifier will be used to deliver personalized ads to you.',
      },
      config: {
        googleMobileAdsAppId: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
      },
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-build-properties',
      'expo-android-app-gradle-dependencies',
    ],
    extra: {
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleMobileAds: {
        android_app_id: process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
        ios_app_id: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
        android_banner_id: process.env.EXPO_PUBLIC_ANDROID_ADMOB_BANNER_ID,
        ios_banner_id: process.env.EXPO_PUBLIC_IOS_ADMOB_BANNER_ID,
      },
      eas: {
        projectId: 'c4c59e78-7812-4f31-b4d4-20c9f09c4c8b', // ← this is the ID you're using
      },
    },
  },
};
