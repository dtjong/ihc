import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import Container from '../components/Container';

export default class WelcomeScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {loading: false, errorMsg: null};
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

  upload = () => {
    this.setState({loading: true});
    const patients = localData.getPatientsToUpload();
    serverData.updatePatients(patients)
      .then(() => {
        localData.markPatientsUploaded();
        this.setState({loading: false});
      })
      .catch(err => {
        this.setState({errorMsg: err.message, loading: false});
      });
  }

  download = () => {
    this.setState({loading: true});
    const lastSynced = localData.lastSynced();

    serverData.getUpdatedPatients(lastSynced)
      .then((patients) => {
        localData.handleDownloadedPatients(patients);
        this.setState({loading: false});
      })
      .catch(err => {
        this.setState({errorMsg: err.message, loading: false});
      });
  }

  render() {
    return (
      <Container loading={this.state.loading} 
        errorMsg={this.state.errorMsg} >
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
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
