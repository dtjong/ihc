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

export default class PatientSelectScreen extends Component<{}> {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: null,
      successMsg: null,
      loading: false,
      rows: [],
      showRetryButton: false,
      upstreamSyncing: false // Should be set before server calls to declare what kind of syncing
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
    this.setState({ loading: true, upstreamSyncing: false, errorMsg: null, successMsg: null });

    // Load local data in beginning to display even if sync doesn't work
    const today = stringDate(new Date());
    const oldStatuses = localData.getStatuses(today);
    const oldRowData = this.convertStatusesToRows(oldStatuses);
    this.setState({rows: oldRowData});

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        if(failedPatientKeys.length > 0) {
          throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
        }
        const newStatuses = localData.getStatuses(today);
        const newRowData = this.convertStatusesToRows(newStatuses);
        this.setState({rows: newRowData, loading: false});
      })
      .catch(err => {
        this.setState({loading: false, errorMsg: err.message});
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


  goToPatient = (patient) => {
    this.props.navigator.push({
      screen: 'Ihc.PatientHomeScreen',
      title: patient.name,
      passProps: { name: patient[0], patientKey: patient[7] }
    });
  }

  // Update the statusObj with notes from the modal
  saveModal = (patientKey, notes) => {
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(patientKey, stringDate(new Date()),
        'notes', notes);
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    this.setState({loading: true, upstreamSyncing: true, patientKey: patientKey});
    serverData.updateStatus(statusObj)
      .then( () => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.state.loading) {
          // if successful, then reload screen (which closes modal too)
          this.syncAndLoadPatients();
          this.setState({
            loading: false,
            showRetryButton: false,
            successMsg: 'Saved successfully',
            errorMsg: null
          });
        }
      })
      .catch( (e) => {
        if(this.state.loading) {
          localData.markPatientNeedToUpload(patientKey);
          this.setState({
            errorMsg: e.message,
            successMsg: null,
            loading: false,
            showRetryButton: true
          });
        }
      });
  }

  // If Loading was canceled, we want to show a retry button
  setLoading = (val, canceled) => {
    let errorMsg = null;
    // View README: Handle syncing the tablet, point 5 for explanation
    if(canceled && this.state.upstreamSyncing === false) {
      errorMsg = 'Canceling may cause data to be out of sync.';
    }
    this.setState({loading: val, showRetryButton: canceled, errorMsg: errorMsg});
  }

  setMsg = (type, msg) => {
    const obj = {};
    obj[type] = msg;
    const other = type === 'successMsg' ? 'errorMsg' : 'successMsg';
    obj[other] = null;
    this.setState(obj);
  }

  render() {
    return (
      <Container loading={this.state.loading}
        errorMsg={this.state.errorMsg}
        successMsg={this.state.successMsg}
        setLoading={this.setLoading}
        setMsg={this.setMsg}
        patientKey={this.state.patientKey}
        showRetryButton={this.state.showRetryButton}
      >
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
