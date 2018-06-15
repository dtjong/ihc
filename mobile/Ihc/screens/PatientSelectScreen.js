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

export default class PatientSelectScreen extends Component<{}> {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: null,
      successMsg: null,
      loading: false,
      rows: [],
      showRetryButton: false,
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  loadPatients = () => {
    this.setState({ loading: true });
    const data = localData.getPatientSelectRows();
    this.setState({ rows: data, loading: false });
  }

  // Reload table after moving back to table
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.loadPatients();
    }
  }

  componentDidMount() {
    this.loadPatients();
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

    this.setState({loading: true});
    serverData.updateStatus(statusObj)
      .then( () => {
        if(this.state.loading) {
          // if successful, then reload data and close modal
          this.loadPatients();
          this.setState({
            loading: false,
            showRetryButton: false,
            successMsg: 'Saved successfully',
            errorMsg: null
          });
          this.closeModal();
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
    this.setState({loading: val, showRetryButton: canceled});
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
