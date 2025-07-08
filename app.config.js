import 'dotenv/config';

export default {
  expo: {
    name: 'picture-recipes-app',
    slug: 'picture-recipes-app',
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "We need your permission to access the camera"
      }
    },
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
