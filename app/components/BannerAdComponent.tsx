// import React from 'react';
// import { View, StyleSheet, Platform } from 'react-native';
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds,
// } from 'react-native-google-mobile-ads';
// import Constants from 'expo-constants';

// const { googleMobileAds: { android_banner_id = '', ios_banner_id = '' } = {} } =
//   Constants.expoConfig?.extra ?? {};

// const adUnitId = __DEV__
//   ? TestIds.BANNER
//   : Platform.OS === 'ios'
//   ? ios_banner_id
//   : android_banner_id;

// const BannerAdComponent = () => {
//   return (
//     <View style={styles.adContainer}>
//       <BannerAd
//         unitId={adUnitId}
//         size={BannerAdSize.ADAPTIVE_BANNER}
//         requestOptions={{
//           requestNonPersonalizedAdsOnly: true,
//         }}
//         onAdLoaded={() => console.log('Ad loaded')}
//         onAdFailedToLoad={(error) => console.error('Ad failed to load', error)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   adContainer: {
//     alignItems: 'center',
//     marginTop: 10,
//   },
// });

// export default BannerAdComponent;
