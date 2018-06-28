import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import MedicationTable  from '../components/MedicationTable';
import Container from '../components/Container';
import {stringDate} from '../util/Date';
import DrugUpdate from '../models/DrugUpdate';
import Button from '../components/Button';

export default class MedicationScreen extends Component<{}> {
  /*
   * Props:
   * name: patient's name for convenience
   * patientKey: string of patient's key
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      updates: [],
      errorMsg: null,
      successMsg: null,
      medicationCheckmarks: [],
      todayDate: stringDate(new Date())
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  // Reload table after new medication updates
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.loadMedications();
    }
  }

  refillMedication = (prevDrugUpdate) => {
    const newUpdate = Object.assign({}, prevDrugUpdate);
    newUpdate.date = this.state.todayDate;

    try {
      localData.createDrugUpdate(newUpdate);
      this.loadMedications();
      this.setState({errorMsg: null});
    } catch(e) {
      this.setState({errorMsg: e.message});
    }
  }

  changeMedication = (prevDrugUpdate) => {
    this.props.navigator.push({
      screen: 'Ihc.MedicationUpdateScreen',
      title: 'Medication',
      passProps: {
        drugUpdate: prevDrugUpdate,
        action: 'change',
        patientKey: this.props.patientKey,
        name: this.props.name
      }
    });
  }

  discontinueMedication = (prevDrugUpdate) => {
    // Add a dummy drug update to updates prop
    const newUpdate = DrugUpdate.getDiscontinueDummy(prevDrugUpdate);
    this.setState({
      updates: this.state.updates.concat([newUpdate])
    });
  }

  createNewMedication = () => {
    this.props.navigator.push({
      screen: 'Ihc.MedicationUpdateScreen',
      title: 'Medication',
      passProps: {
        action: 'new',
        patientKey: this.props.patientKey,
        name: this.props.name
      }
    });
  }

  loadMedications = () => {
    this.setState({ loading: true });
    let updates = localData.getMedicationUpdates(this.props.patientKey);
    let statusObj = localData.getStatus(this.props.patientKey, this.state.todayDate);
    const checkmarks = statusObj.medicationCheckmarks;
    this.setState({
      updates: updates,
      loading: false,
      medicationCheckmarks: checkmarks,
    });
  }

  componentDidMount() {
    this.loadMedications();
  }

  saveCheckmarks = () => {
    // Local checkmark saves are handled in MedicationTable directly.
    const statusObj = localData.getStatus(this.props.patientKey, this.state.todayDate);

    this.setState({
      loading: true,
      errorMsg: null,
      successMsg: null,
    });

    serverData.updateStatus(statusObj)
      .then( () => {
        if(this.state.loading) {
          this.setState({
            successMsg: 'Saved',
            errorMsg: null,
            loading: false,
            showRetryButton: false
          });
        }
      })
      .catch( (e) => {
        if(this.state.loading) {
          localData.markPatientNeedToUpload(this.props.patientKey);
          this.setState({
            successMsg: null,
            errorMsg: e.message,
            loading: false,
            showRetryButton: true
          });
        }
      });
  }

  // station: 'Doctor' or 'Pharmacy'
  updateStatus(station) {
    this.setState({
      loading: true,
      errorMsg: null,
      successMsg: null,
    });

    let statusObj = {};
    if(station != 'Doctor' && station != 'Pharmacy') {
      throw new Error(`Received invalid station: ${station}`);
    }

    const fieldName = station === 'Doctor' ? 'doctorCompleted' : 'pharmacyCompleted';
    try {
      statusObj = localData.updateStatus(this.props.patientKey, this.state.todayDate,
        fieldName, new Date().getTime());
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null, loading: false});
      return;
    }

    serverData.updateStatus(statusObj)
      .then( () => {
        if(this.state.loading) {
          this.setState({
            successMsg: `${station} marked as completed`,
            errorMsg: null,
            loading: false,
            showRetryButton: false
          });
        }
      })
      .catch( (e) => {
        if(this.state.loading) {
          localData.markPatientNeedToUpload(this.props.patientKey);
          this.setState({
            successMsg: null,
            errorMsg: e.message,
            loading: false,
            showRetryButton: true
          });
        }
      });
  }

  completed = () => {
    this.updateStatus('Doctor');
  }

  filled = () => {
    this.updateStatus('Pharmacy');
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
        patientKey={this.props.patientKey}
        showRetryButton={this.state.showRetryButton}
      >

        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {this.props.name}'s Medications
          </Text>

          <Text>R: Refill, D: Change Dose, X: Cancel</Text>
          <Text>T: Taking, N: Not Taking, I: Taking incorrectly</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationTable style={styles.table}
            refill={this.refillMedication}
            change={this.changeMedication}
            discontinue={this.discontinueMedication}
            updates={this.state.updates}
            medicationCheckmarks={this.state.medicationCheckmarks}
            patientKey={this.props.patientKey}
          />
        </ScrollView>

        <View style={styles.footerContainer}>
          <Button
            onPress={this.saveCheckmarks}
            style={styles.button}
            text='Save checkmarks'>
          </Button>

          <Button
            onPress={this.createNewMedication}
            style={styles.button}
            text='New Medication'>
          </Button>

          <Button
            onPress={this.completed}
            style={styles.button}
            text='Completed Prescribing'>
          </Button>

          <Button
            onPress={this.filled}
            style={styles.button}
            text='Filled'>
          </Button>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 0,
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    margin: 4,
  },
  button: {
    width: 120,
    height: 60 
  }
});
