/*
 * display when a component called an async service we want to show a loading
 * indicator for
 */
import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {localData} from '../services/DataService';
import Button from './Button';

export default class Loading extends Component<{}> {
  /*
   * props:
   * patientKey: the patientKey to mark as upload in case loading is canceled,
   *   or null if not needed
   * setMsg: function to set error msg if cancel button is clicked
   *   or null if not needed
   * setLoading: function to toggle loading, second param is true if user canceled
   * cancellable: optional boolean, true by default
   */
  constructor(props) {
    super(props);
  }

  cancel = () => {
    if(this.props.patientKey) {
      localData.markPatientNeedToUpload(this.props.patientKey);
    }

    if(this.props.setMsg) {
      this.props.setMsg('errorMsg', 'Cancelled. May need to retry.');
    }

    this.props.setLoading(false, true);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
        <ActivityIndicator size="large" />
        { this.props.cancellable === true || this.props.cancellable === undefined ?
          <Button style={styles.button} text="Cancel" onPress={this.cancel} /> : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    margin: 4
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#F5FCFF'
  },
  button: {
    width: 120
  }
});
