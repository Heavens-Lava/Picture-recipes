import 'dotenv/config';

export default {
  expo: {
    name: 'picture-recipes2',
    slug: 'picture-recipes2',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/icons/picture-recipes-icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    android: {
      permissions: ['CAMERA'],
      package: 'com.jeffreymacy.picturerecipesapp',
      manifest: {
        application: {
          metaData: [
            {
              name: 'com.google.android.gms.ads.APPLICATION_ID',
              value: process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
            },
          ],
        },
      },
    },
    ios: {
      bundleIdentifier: 'com.jeffreymacy.picturerecipesapp',
      infoPlist: {
        NSCameraUsageDescription:
          'We need your permission to access the camera',
        GADApplicationIdentifier: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
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
        projectId: '82b9175c-9f84-4492-a8e4-d2d6a06eb2c7',
      },
      ANDROID_ADMOB_APP_ID: process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
      IOS_ADMOB_APP_ID: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
    },
  },
};
