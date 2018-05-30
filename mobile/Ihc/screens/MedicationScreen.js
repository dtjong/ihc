import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import MedicationTable  from '../components/MedicationTable';
import Container from '../components/Container';
import {stringDate} from '../util/Date';
import DrugUpdate from '../models/DrugUpdate';

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
    const date = stringDate(new Date());
    const newUpdate = Object.assign({}, prevDrugUpdate);
    newUpdate.date = date;

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
    this.setState({updates: updates, loading: false});
  }

  componentDidMount() {
    this.loadMedications();
  }


  // station: 'Doctor' or 'Pharmacy'
  updateStatus(station) {
    this.setState({loading: true});
    let statusObj = {};
    if(station != 'Doctor' && station != 'Pharmacy') {
      throw new Error(`Received invalid station: ${station}`);
    }

    const fieldName = station === 'Doctor' ? 'doctorCompleted' : 'pharmacyCompleted';
    try {
      statusObj = localData.updateStatus(this.props.patientKey, stringDate(new Date()),
        fieldName, new Date().getTime());
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null, loading: false});
      return;
    }

    serverData.updateStatus(statusObj)
      .then( () => {
        this.setState({
          successMsg: `${station} marked as completed`,
          errorMsg: null,
          loading: false
        });
      })
      .catch( (e) => {
        localData.markPatientNeedToUpload(this.props.patientKey);
        this.setState({
          successMsg: null,
          errorMsg: `${e.message}. Try to UploadUpdates`,
          loading: false
        });
      });
  }

  completed = () => {
    this.updateStatus('Doctor');
  }

  filled = () => {
    this.updateStatus('Pharmacy');
  }

  render() {
    return (
      <Container loading={this.state.loading}
        errorMsg={this.state.errorMsg}
        successMsg={this.state.successMsg} >

        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {this.props.name}'s Medications
          </Text>

          <Text>R: Refill, D: Change Dose, X: Cancel</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationTable style={styles.table}
            refill={this.refillMedication}
            change={this.changeMedication}
            discontinue={this.discontinueMedication}
            updates={this.state.updates}
          />
        </ScrollView>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={this.createNewMedication}>
            <Text style={styles.button}>New Medication</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={this.completed}>
            <Text style={styles.button}>Completed Prescribing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={this.filled}>
            <Text style={styles.button}>Filled</Text>
          </TouchableOpacity>
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
  buttonContainer: {
    width: 120,
    margin: 4,
    padding: 8,
    elevation: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
    height: 40,
  },
  button: {
    fontWeight: '500',
    color: '#fefefe',
    textAlign: 'center',
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    margin: 4,
  },
});
