// CameraViewComponent.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import FastImage from 'expo-fast-image';

export interface CameraViewComponentProps {
  cameraRef: React.RefObject<CameraView>;
  facing: CameraType;
  lastPhoto: string | null;
  isAnalyzing: boolean;
  styles: any;
}

const CameraViewComponent: React.FC<CameraViewComponentProps> = ({
  cameraRef,
  facing,
  lastPhoto,
  isAnalyzing,
  styles,
}) => {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={[styles.cameraContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ marginBottom: 10 }}>Camera permission is required to use this feature.</Text>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      {lastPhoto && (
        <View style={styles.lastPhotoContainer}>
          <FastImage
            source={{ uri: lastPhoto }}
            style={styles.lastPhoto}
            cacheKey="fridge-preview"
          />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraViewComponent;
