import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View
} from 'react-native';

import SuccessErrorMessages from './SuccessErrorMessages';
import Loading from './Loading';
import {localData, serverData} from '../services/DataService';
import Button from './Button';
import {downstreamSyncWithServer} from '../util/Sync';

/*
 * Common wrapper around Screens. Includes code for the ScrollView,
 * Success/Error messages, Retry button, and Loading indicator
 */
export default class Container extends Component<{}> {
  /*
   * props:
   * loading: boolean true if the component is loading
   * successMsg: null or string
   * errorMsg: null or string
   * children: the JSX that will be displayed within the container
   * patientKey: the patientKey to mark as upload in case loading is canceled,
   *   or null if not needed
   * setMsg: function to set msg, or null if not needed.
   *   First param is 'successMsg'/'errorMsg', second is  the message.
   * setLoading: function that configures loading in parent, and passes in
   *   second param that is true if the loading was Canceled
   * showRetryButton: boolean
   * cancellableLoading: optional boolean, true by default
   * isUploading: true if the screen is trying to upload to the server, false if
   * the screen is trying to download from the server. Used for Retry button.
   *
   * use Container like
   * <Container loading={this.state.loading}>
   *  <Text>Text</Text>
   * </Container>
   */
  constructor(props) {
    super(props);
  }

  // Retry retries sending ALL updates, so is equivalent to Upload Updates
  // button on the WelcomeScreen
  retry = () => {
    if(this.props.isUploading)
      this.retryUpload();
    else
      this.retryDownload();
  }

  retryDownload = () => {
    this.props.setLoading(true);
    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        if(this.props.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          if(this.props.setMsg)
            this.props.setMsg('successMsg', 'Downloaded successfully');
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          if(this.props.setMsg)
            this.props.setMsg('errorMsg', err.message);
          this.props.setLoading(false);
        }
      });
  }

  retryUpload = () => {
    this.props.setLoading(true);
    const patients = localData.getPatientsToUpload();
    serverData.updatePatients(patients)
      .then(() => {
        if(this.props.loading) {
          localData.markPatientsUploaded();
          if(this.props.setMsg)
            this.props.setMsg('successMsg', 'Uploaded successfully');
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          if(this.props.setMsg)
            this.props.setMsg('errorMsg', err.message);
          this.props.setLoading(false);
        }
      });
  }

  render = () => {
    if (this.props.loading) {
      return (
        <View style={styles.outside}>
          <Loading
            patientKey={this.props.patientKey}
            setMsg={this.props.setMsg}
            setLoading={this.props.setLoading}
            cancellable={this.props.cancellableLoading}
          />
        </View>
      );
    }

    if (this.props.showRetryButton) {
      return (
        <View style={styles.outside}>
          <ScrollView contentContainerStyle={styles.container}>
            {this.props.children}
          </ ScrollView>

          <View style={styles.buttonContainer}>
            <Button text="Retry" onPress={this.retry} />
          </View>

          <SuccessErrorMessages errorMsg={this.props.errorMsg}
            successMsg={this.props.successMsg} />
        </View>
      );
    }

    return (
      <View style={styles.outside}>
        <ScrollView contentContainerStyle={styles.container}>
          {this.props.children}
        </ ScrollView>

        <SuccessErrorMessages errorMsg={this.props.errorMsg}
          successMsg={this.props.successMsg} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  outside: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  container: {
    flex: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
