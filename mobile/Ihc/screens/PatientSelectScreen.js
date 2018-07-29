import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import {stringDate} from '../util/Date';
import PatientTable from '../components/PatientTable';
import Container from '../components/Container';
import {downstreamSyncWithServer} from '../util/Sync';

class PatientSelectScreen extends Component<{}> {
  /*
   * Redux props:
   * loading: boolean
   */
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  convertStatusesToRows(statuses) {
    const columnOrder = ['name', 'birthday', 'checkinTime', 'triageCompleted',
      'doctorCompleted', 'pharmacyCompleted', 'notes', 'patientKey'];

    // Sort statuses by checkin time for now
    statuses.sort( (status1, status2) => status1.checkinTime - status2.checkinTime );

    const toReturn = statuses.map((obj) => columnOrder.map( (key) => obj[key] ));
    return toReturn;
  }

  // Sync up tablet first with server before grabbing statuses
  syncAndLoadPatients = () => {
    this.props.setCurrentPatientKey(null);
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    // Load local data in beginning to display even if sync doesn't work
    const today = stringDate(new Date());
    const oldStatuses = localData.getStatuses(today);
    const oldRowData = this.convertStatusesToRows(oldStatuses);
    this.setState({rows: oldRowData});

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }
          const newStatuses = localData.getStatuses(today);
          const newRowData = this.convertStatusesToRows(newStatuses);

          this.setState({rows: newRowData});
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  // Reload table after moving back to table
  // Replaces componentDidMount() because this will be called around the same
  // time
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadPatients();
    }
  }

  // patient is an array containing one row of data from the PatientTable
  // PatientKey stored in index 7
  goToPatient = (patient) => {
    this.props.setCurrentPatientKey(patient[7]);
    this.props.navigator.push({
      screen: 'Ihc.PatientHomeScreen',
      title: patient.name,
      passProps: { name: patient[0] }
    });
  }

  // Update the statusObj with notes from the modal
  saveModal = (patientKey, notes) => {
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(patientKey, stringDate(new Date()),
        'notes', notes);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }

    this.props.setLoading(true);
    this.props.isUploading(true);
    this.props.setCurrentPatientKey(patientKey);

    serverData.updateStatus(statusObj)
      .then( () => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          // if successful, then reload screen (which closes modal too)
          this.syncAndLoadPatients();

          this.props.setLoading(false);
          this.props.setSuccessMessage('Saved successfully');
        }
      })
      .catch( (e) => {
        if(this.props.loading) {
          localData.markPatientNeedToUpload(patientKey);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(e.message);
        }
      });
  }

  render() {
    return (
      <Container>
        <Text style={styles.title}>
          Select a Patient
        </Text>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <PatientTable
            rows={this.state.rows}
            goToPatient={this.goToPatient}
            saveModal={this.saveModal}
          />
        </ScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  tableContainer: {
    width: '100%'
  },
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading, setCurrentPatientKey } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val)),
  setCurrentPatientKey: key => dispatch(setCurrentPatientKey(key))
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientSelectScreen);
