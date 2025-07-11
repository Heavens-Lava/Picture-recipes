import OpenAI from 'openai';
import Constants from 'expo-constants';

// Initialize OpenAI client with your API key from Expo Constants
const openai = new OpenAI({
  apiKey: Constants.expoConfig.extra.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Ensure it works in the Expo environment
});


export default openai;
