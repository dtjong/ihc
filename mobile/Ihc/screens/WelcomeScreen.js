import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Button,
  Text,
  View
} from 'react-native';
import data from '../services/DataService';

export default class WelcomeScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {loading: false, error: null};
  }

  goToSignin = () => {
    this.props.navigator.push({
      screen: 'Ihc.SigninScreen',
      title: 'Signin'
    });
  }

  goToSelectPatient = () => {
    this.props.navigator.push({
      screen: 'Ihc.PatientSelectScreen',
      title: 'Select patient'
    });
  }

  // TODO: When updates fail, mark the patient's needToUpload: true
  upload = () => {
    this.setState({loading: true});
    data.uploadUpdates()
      .then(() => {
        this.setState({loading: false});
      })
      .catch(err => {
        this.setState({error: err.message, loading: false});
      });
  }

  download = () => {
    this.setState({loading: true});
    data.downloadUpdates()
      .then(() => {
        this.setState({loading: false});
      })
      .catch(err => {
        this.setState({error: err.message, loading: false});
      });
  }

  render() {
    if(this.state.loading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to clinic!
        </Text>
        <Button onPress={this.goToSignin}
          title="Signin"
        />
        <Button onPress={this.goToSelectPatient}
          title="Select Patient"
        />
        <Button onPress={this.upload}
          title="Upload updates"
        />
        <Button onPress={this.download}
          title="Download updates"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
