import React, { ComponentProps } from 'react';
import QRCode from 'react-native-qrcode-svg';

type Props = Readonly<ComponentProps<typeof QRCode>>;

const QRCODE = (props: Props) => {
    return (
        <QRCode
            {...props}
            size={250}
            color="black"
            backgroundColor="white"
        />
    )
}

export default QRCODE;
