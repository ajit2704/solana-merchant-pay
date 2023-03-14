import React, { ComponentProps } from 'react';
import { StyleSheet} from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = Readonly<ComponentProps<typeof TextInput>>
const PaymentText = (props: Props) => {

  return (

    <TextInput
      {...props}
      mode='flat'
      style={styles.input}
      keyboardType="numeric"
      underlineColorAndroid='transparent'
      selectionColor={'black'}
      activeUnderlineColor='transparent'
    />

  )
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    height: 30,
    width: 100,
    margin: 12,
    borderWidth: 0,
    padding: 10,
    fontSize: 23,
    color: 'white',
    backgroundColor: 'white',
    textAlign: 'center',
  },
})

export default PaymentText;