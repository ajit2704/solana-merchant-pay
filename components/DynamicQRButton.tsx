
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import {
  Button,
  Text,
} from 'react-native-paper';

import useAuthorization from '../utils/useAuthorization';
import PaymentText from './PaymentText';
import AntIcon from 'react-native-vector-icons/AntDesign';
import QRModal from './QRModal';
import QRCODE from './QRCode';
import Icon from 'react-native-vector-icons/AntDesign';


type Props = Readonly<{
  children?: React.ReactNode;
}>;

export default function DynamicQRButton({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const [number, onChangeNumber] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const [productQRref, setProductQRref] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.centeredView}>
        <QRModal
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.container}>
            <Icon
              name='close'
              onPress={() => setModalVisible(false)}
              style={{
                position: 'absolute',
                left: 15,
                right: 0,
                top: 50,
                bottom: 0,
                fontSize: 30,
              }} />
            <Text style={styles.qrText}>QR Code</Text>
            <QRCODE
              value={JSON.stringify({
                flag: true,
                pubKey: selectedAccount?.publicKey.toBase58(),
                amount: number
              })}
              getRef={(c) => setProductQRref(c)} />
          </View>

        </QRModal>
      </View>
      <View style={styles.paymentCentered}>
        <Modal
          animationType="slide"
          visible={showPayment}
        >
          <View style={styles.modalView}>
            <PaymentText
              value={number}
              onChangeText={onChangeNumber}
            />
            <AntIcon
              name={"arrowright"}
              color="black" size={45}
              style={{ paddingEnd: 5 }}
              onPress={() => {

                try {
                  setModalVisible(true)
                } finally {
                  setShowPayment(false)
                }

              }}
            />
          </View>

        </Modal>
      </View>
      <View style={styles.buttonGroup}>
        <Button
          onPress={() => {
            setShowPayment(true)
          }}
          mode="contained"
          style={styles.actionButton}>
          {children}
        </Button>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginEnd: 8,
  },
  infoButton: {
    margin: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
  },
  paymentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 50,
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  qrText: {
    top: -20,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});
