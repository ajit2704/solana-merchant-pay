import React, { useContext, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from './Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRScanner from './QRScanner';
import QRModal from './QRModal';
import PaymentText from './PaymentText';
import AntIcon from 'react-native-vector-icons/AntDesign';

import {
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import useAuthorization from '../utils/useAuthorization';
import { useConnection } from '@solana/wallet-adapter-react';
import useGuardedCallback from '../utils/useGuardedCallback';
import { SnackbarContext } from './SnackbarProvider';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

//@ts-ignore
window.Buffer = window.Buffer || require("buffer").Buffer;


export function Header() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showScan, setShowScan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pubkey, setPubKey] = useState('');
  const [number, onChangeNumber] = useState('');
  const setSnackbarProps = useContext(SnackbarContext);

  const { authorizeSession, selectedAccount } = useAuthorization();
  const { connection } = useConnection();

  const handlePayment = useGuardedCallback(
    async (publicKey: String, amount: number
    ): Promise<[string, RpcResponseAndContext<SignatureResult>]> => {
      const [signature] = await transact(async wallet => {
        const [freshAccount, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);
        console.warn(amount)
        const memoProgramTransaction = new Transaction(
          {
            ...latestBlockhash,
            feePayer:
              selectedAccount?.publicKey ??
              freshAccount.publicKey,
          }
        ).add(
          SystemProgram.transfer({

            fromPubkey: selectedAccount?.publicKey ??
              freshAccount.publicKey,
            toPubkey: new PublicKey(publicKey),
            lamports: parseInt(number) * LAMPORTS_PER_SOL / 100
          })
        )

        return await wallet.signAndSendTransactions({
          transactions: [memoProgramTransaction],
        });
      });
      return [signature, await connection.confirmTransaction(signature)];
    },
    [authorizeSession, connection, selectedAccount],
  );
  return (
    <>

      <ImageBackground
        accessibilityRole="image"
        testID="new-app-screen-header"
        source={require('../assets/background.png')}
        style={[
          styles.background,
          {
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
          },
        ]}
        imageStyle={styles.logo}>

        <View style={styles.centeredView}>
          <QRModal
            visible={showScan}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setShowScan(false)
            }}
          >
            <View style={styles.container}>
              {//@ts-ignore
                <QRScanner
                  allowCaptureRetake={false}
                  onReadCode={async (e) => {
                    console.log(e.nativeEvent.codeStringValue)
                    const data = JSON.parse(e.nativeEvent.codeStringValue)
                    setShowScan(false)
                    if (!data.flag) {
                      setPubKey(data.pubKey)
                      setShowPayment(true)
                    }
                    else {
                      setPubKey(data.pubKey)
                      onChangeNumber(data.amount)
                      try {
                        const result = await handlePayment(data.pubKey,parseInt(data.amount))

                        if (result) {
                          const [signature, response] = result;
                          const {
                            value: { err },
                          } = response;
                          if (err) {
                            setSnackbarProps({
                              children:
                                'Failed transaction:' +
                                (err instanceof Error ? err.message : err),
                            });
                          } else {
                            setSnackbarProps({
                              action: {
                                label: 'View',
                                onPress() {
                                  const explorerUrl =
                                    'https://explorer.solana.com/tx/' +
                                    signature +
                                    '?cluster=' +
                                    WalletAdapterNetwork.Devnet;
                                  Linking.openURL(explorerUrl);
                                },
                              },
                              children: 'Transaction successful',
                            });
                          }
                        }
                      } finally {
                        setShowPayment(false)
                      }
                    }

                  }}
                />}
            </View>

          </QRModal>
        </View>
        <View style={styles.paymentCentered}>
          <Modal
            // {...props}
            animationType="slide"
            // transparent={true}
            visible={showPayment}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setShowPayment(false)
            }}
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
                onPress={async () => {

                  try {
                    const result = await handlePayment(pubkey,parseInt(number))

                    if (result) {
                      const [signature, response] = result;
                      const {
                        value: { err },
                      } = response;
                      if (err) {
                        setSnackbarProps({
                          children:
                            'Failed transaction:' +
                            (err instanceof Error ? err.message : err),
                        });
                      } else {
                        setSnackbarProps({
                          action: {
                            label: 'View',
                            onPress() {
                              const explorerUrl =
                                'https://explorer.solana.com/tx/' +
                                signature +
                                '?cluster=' +
                                WalletAdapterNetwork.Devnet;
                              Linking.openURL(explorerUrl);
                            },
                          },
                          children: 'Transaction successful',
                        });
                      }
                    }
                  } finally {
                    setShowPayment(false)
                  }

                }}
              />
            </View>

          </Modal>
        </View>
        <Icon
          name='camera'
          onPress={() => {
            setShowScan(true)
          }}
          style={{
            position: 'absolute',
            left: '100%',
            right: 0,
            top: 15,
            bottom: 0,
            fontSize: 30,
            color: 'black'
          }} />
        <View>
          <Text style={styles.title}>Solana</Text>
          <Text style={styles.subtitle}>Merchant Pay</Text>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingBottom: 40,
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  logo: {
    overflow: 'visible',
    resizeMode: 'cover',
  },
  subtitle: {
    color: '#333',
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  qrText: {
    top: -20,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
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

});
