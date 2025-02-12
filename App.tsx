import { Button, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const cameraRef = useRef<CameraView>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Você precisa dar permissão para exibir a camera</Text>
        <Button onPress={requestPermission} title="Pedir permissão" />
      </View>
    );
  }

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleTakePicture = async () => {
    if (cameraReady && cameraRef.current) {
      const options = { quality: 0.7, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      if (photo) {
        setPhotos([photo.uri, ...photos]);
      }
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([result.assets[0].uri, ...photos]);
    }
  };

  const handlePhotoPress = (uri: string) => {
    if (selectedPhotos.includes(uri)) {
      setSelectedPhotos(selectedPhotos.filter((item) => item !== uri));
    } else {
      setSelectedPhotos([...selectedPhotos, uri]);
    }
  };

  const handleDeletePhotos = () => {
    setPhotos(photos.filter((photo) => !selectedPhotos.includes(photo)));
    setSelectedPhotos([]);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} onCameraReady={handleCameraReady} ref={cameraRef} />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePickImage}>
          <Text style={styles.buttonText}>Galeria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
          <Text style={styles.buttonText}>Capturar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePhotoPress(item)}>
            <Image
              source={{ uri: item }}
              style={[
                styles.photo,
                selectedPhotos.includes(item) && styles.selectedPhoto,
              ]}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        inverted={false}
      />
      <Button title="Excluir fotos selecionadas" onPress={handleDeletePhotos} disabled={selectedPhotos.length === 0} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#D11A2A',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
  selectedPhoto: {
    opacity: 0.5,
  },
});