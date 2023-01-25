import { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import domtoimage from 'dom-to-image';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as ImagePicker from 'expo-image-picker';
import Button from './components/Button';
import EmojiList from './components/EmojiList';
import IconButton from './components/IconButton';
import EmojiPicker from './components/EmojiPicker';
import ImageViewer from './components/ImageViewer';
import EmojiSticker from './components/EmojiSticker';
import CircleButton from './components/CircleButton';

const PlaceholderImage = require('./assets/images/background-image.png');

export default function App() {
    const [status, requestPermission] = MediaLibrary.usePermissions(),
        imageRef = useRef(),
        [selectedImage, setSelectedImage] = useState(null),
        [pickedEmoji, setPickedEmoji] = useState(null),
        [isModalVisible, setIsModalVisible] = useState(false),
        [showAppOptions, setShowAppOptions] = useState(false);

    if (status === null) {
        requestPermission();
    }

    const onAddSticker = () => {
        setIsModalVisible(true);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const onReset = () => {
        setShowAppOptions(false);
        setPickedEmoji(null);
    };

    const onSaveImageAsync = async () => {
        if (Platform.OS !== 'web') {
            try {
                const localUri = await captureRef(imageRef, {
                    height: 440,
                    quality: 1,
                });
                await MediaLibrary.saveToLibraryAsync(localUri);
                if (localUri) {
                    alert('Saved!');
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            domtoimage
                .toJpeg(imageRef.current, {
                    quality: 0.95,
                    width: 320,
                    height: 440,
                })
                .then((dataUrl) => {
                    let link = document.createElement('a');
                    link.download = 'sticker-smash.jpeg';
                    link.href = dataUrl;
                    link.click();
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setShowAppOptions(true);
        } else {
            alert('You did not select any image.');
        }
    };

    const resetShowAppOptions = () => {
        setShowAppOptions(false);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <View ref={imageRef} collapsable={false}>
                        <ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage} />
                        {pickedEmoji !== null ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> : null}
                    </View>
                </View>

                {showAppOptions ? (
                    <View style={styles.optionsContainer}>
                        <View style={styles.optionsRow}>
                            <IconButton icon="refresh" label="Reset" onPress={onReset} />
                            <CircleButton onPress={onAddSticker} />
                            <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.footerContainer}>
                        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
                        <Button label="Use this photo" />
                    </View>
                )}

                <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                    <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
                </EmojiPicker>

                <StatusBar style="auto" onPress={resetShowAppOptions} />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        paddingTop: 58,
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center',
    },
    optionsContainer: {
        position: 'absolute',
        bottom: 80,
    },
    optionsRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});
