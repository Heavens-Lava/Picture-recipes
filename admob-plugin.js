const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

function withAndroidAdMob(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest.application[0]['meta-data'] ??= [];
    config.modResults.manifest.application[0]['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
      },
    });
    return config;
  });
}

function withIosAdMob(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.GADApplicationIdentifier =
      process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID;
    return config;
  });
}

module.exports = {
  withAndroidAdMob,
  withIosAdMob,
};
