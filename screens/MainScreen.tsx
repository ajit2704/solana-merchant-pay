import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Divider, Portal, useTheme } from 'react-native-paper';

import AccountInfo from '../components/AccountInfo';
import ConnectButton from '../components/ConnectButton';
import { Header } from '../components/Header';
import StaticQRButton from '../components/StaticQRButton';
import DynamicQRButton from '../components/DynamicQRButton';
import useAuthorization from '../utils/useAuthorization';

export default function MainScreen() {
  const { accounts, onChangeAccount, selectedAccount } = useAuthorization();
  const { colors } = useTheme();
  return (
    <>
      <Header />
      <Portal.Host>
        <ScrollView contentContainerStyle={styles.container}>

          <Divider style={styles.spacer} />
          <StaticQRButton>
            Static QR
          </StaticQRButton>
          <Divider style={styles.spacer} />
          <DynamicQRButton>Dynamic QR</DynamicQRButton>
        </ScrollView>
        {accounts && selectedAccount ? (
          <AccountInfo
            accounts={accounts}
            onChange={onChangeAccount}
            selectedAccount={selectedAccount}
          />
        ) : <ConnectButton buttonColor={colors.success} mode="contained">
          Connect
        </ConnectButton>}
      </Portal.Host>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shell: {
    height: '100%',
  },
  spacer: {
    marginVertical: 16,
    width: '100%',
  },
  textInput: {
    width: '100%',
  },
});
