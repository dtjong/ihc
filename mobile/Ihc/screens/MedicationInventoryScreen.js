import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import MedicationInventory  from '../components/MedicationInventory';
import Container from '../components/Container';
import {stringDate} from '../util/Date';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';

class MedicationInventoryScreen extends Component<{}> {
  /*
   * Props:
	 * 
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showRetryButton: false,
      updates: [],
      errorMsg: null,
      successMsg: null,
      medicationCheckmarks: [],
      todayDate: stringDate(new Date()),
      upstreamSyncing: false, // Should be set before server calls to declare what kind of syncing
    };
    
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  // Update the statusObj with notes from the modal
  saveModal2 = (medicationKey, medicationProps) => {
    let statusObj = {};
    /*try {
      statusObj = localData.updateStatus(patientKey, stringDate(new Date()),
        'notes', notes);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }*/

    this.props.setLoading(true);
    this.props.isUploading(true);
    //this.props.setCurrentPatientKey(patientKey);

  }
  saveModal1 = (newMedication) => {
    let statusObj = {};
    this.props.setLoading(true);
    this.props.isUploading(true);
  }

  // Reload table after new medication updates
  // Replaces componentDidMount() because this will be called around the same
  // time
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadMedications();
    }
  }

  // Sync up tablet first with server before grabbing statuses
  syncAndLoadMedications = () => {
    this.props.setLoading(true);
    //this.props.isUploading(false);
    this.props.clearMessages();
    
    // Load local data in beginning to display even if sync doesn't work
    /*let updates = localData.getMedicationUpdates(this.props.currentPatientKey);
    let statusObj = localData.getStatus(this.props.currentPatientKey, this.state.todayDate);
    const checkmarks = statusObj.medicationCheckmarks;
    this.setState({
      updates: updates,
      medicationCheckmarks: checkmarks,
    });
    */
    this.props.setLoading(false);
/*
    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          let updates = localData.getMedicationUpdates(this.props.currentPatientKey);
          let statusObj = localData.getStatus(this.props.currentPatientKey, this.state.todayDate);
          const checkmarks = statusObj.medicationCheckmarks;

          this.setState({
            updates: updates,
            medicationCheckmarks: checkmarks,
          });
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      });*/
  }


  render() {

    /*tempRows = [];

    medication1 = {
      name: 'Medication',
      properties: {
        medicationKey: 'hello', 
        drugName: 'brent', 
        quantity: 6, 
        dosage: 2, 
        units: 'kgs', 
        comments: 'these are comments'
      }
    }
    tempRows.push(medication1);*/
    return (
      <Container>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medication Inventory</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationInventory
            rows={[]}
            saveModal1={this.saveModal1}
            saveModal2={this.saveModal2}
          />
        </ScrollView>

        
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

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(MedicationInventoryScreen);