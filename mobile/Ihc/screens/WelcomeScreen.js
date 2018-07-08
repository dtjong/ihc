import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import Container from '../components/Container';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';

export default class WelcomeScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {loading: false, errorMsg: null, successMsg: null};
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

  // Don't need to show a retry button because they could just click
  // UploadUpdates again
  /* eslint-disable no-unused-vars */
  setLoading = (val, canceled = false) => {
    this.setState({loading: val});
  }
  /* eslint-enable no-unused-vars */

  upload = () => {
    this.setState({loading: true, errorMsg: null, successMsg: null});
    const patients = localData.getPatientsToUpload();
    serverData.updatePatients(patients)
      .then(() => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.state.loading) {
          localData.markPatientsUploaded();
          this.setState({successMsg: 'Uploaded successfully', errorMsg: null, loading: false});
        }
      })
      .catch(err => {
        if(this.state.loading) {
          this.setState({errorMsg: err.message, successMsg: null, loading: false});
        }
      });
  }

  download = () => {
    this.setState({loading: true, errorMsg: null, successMsg: null});

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.state.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients failed to download. Try again`);
          }
          this.setState({successMsg: 'Downloaded successfully', errorMsg: null, loading: false});
        }
      })
      .catch(err => {
        if(this.state.loading) {
          this.setState({errorMsg: err.message, successMsg: null, loading: false});
        }
      });
  }

  render() {
    return (
      <Container loading={this.state.loading} 
        successMsg={this.state.successMsg}
        errorMsg={this.state.errorMsg}
        setLoading={this.setLoading}
      >
        <Text style={styles.welcome}>
          Welcome to clinic!
        </Text>
        <Button onPress={this.goToSignin}
          text="Signin"
          style={styles.button}
        />
        <Button onPress={this.goToSelectPatient}
          text="Select Patient"
          style={styles.button}
        />
        <Button onPress={this.upload}
          text="Upload updates"
          style={styles.button}
        />
        <Button onPress={this.download}
          text="Download updates"
          style={styles.button}
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
  button: {
    width: 140
  }
});
