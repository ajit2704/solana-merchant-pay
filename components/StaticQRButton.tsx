import React, { useState } from 'react';
import { Alert, PermissionsAndroid, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import {
  Button
} from 'react-native-paper';

import useAuthorization from '../utils/useAuthorization';
import QRModal from './QRModal';
import QRCODE from './QRCode';
import Icon from 'react-native-vector-icons/MaterialIcons';

import RNFS from "react-native-fs";
import CameraRoll from "@react-native-community/cameraroll";

type Props = Readonly<{
  children?: React.ReactNode;
}>;

export default function StaticQRButton({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const [productQRref, setProductQRref] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [recordingInProgress, setRecordingInProgress] = useState(false);

  const saveQrToDisk = async () => {

    if (Platform.OS === "android" &&
      !(await hasAndroidPermission())) {
      return;
    }

    if (productQRref) {

      //@ts-ignore    
      productQRref.toDataURL((data: string) => {

        let filePath = RNFS.CachesDirectoryPath + '/solQR.png';
        RNFS.writeFile(filePath, data, 'base64')
          .then((success) => {
            return CameraRoll.saveToCameraRoll(filePath, "photo")
          })
          .then(() => {
            ToastAndroid.show('QRCode saved to gallery', ToastAndroid.LONG);
          });
      });
    }
  }

  const hasAndroidPermission = async () => {
    const permission =
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission =
      await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

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
                flag: false,
                pubKey: selectedAccount?.publicKey.toBase58()
              })}
              getRef={(c) => setProductQRref(c)} />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => { saveQrToDisk() }}>
              <Text style={styles.save}>Save to Gallery</Text>
            </TouchableOpacity>
          </View>

        </QRModal>
      </View>
      <View style={styles.buttonGroup}>
        <Button
          loading={recordingInProgress}
          onPress={() => {
            if (recordingInProgress) {
              return;
            }
            setRecordingInProgress(true);
            try {

              setModalVisible(true)

            } finally {
              setRecordingInProgress(false);
            }
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
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  qrText: {
    top: -20,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },

  save: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'capitalize'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButton: {
    borderRadius: 30,
    padding: 15,
    position: 'absolute',
    bottom: 0,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    backgroundColor: "#273746"
  },

});
