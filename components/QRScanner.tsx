import React, { ComponentProps } from 'react';
import { CameraScreen } from 'react-native-camera-kit';

type Props = Readonly<ComponentProps<typeof CameraScreen>>;

const QRScanner = (props: Props) => {
    //@ts-ignore
    return <CameraScreen
        {...props}
        scanBarcode={true}
        laserColor={'blue'}
        frameColor={'yellow'}
        showFrame={true}
    />
}

export default QRScanner;