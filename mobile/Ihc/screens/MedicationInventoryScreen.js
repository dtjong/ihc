import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
<<<<<<< HEAD
let t = require('tcomb-form-native');
let Form = t.form.Form;

=======
>>>>>>> e20195c4dd3d452c52ba20e6cb220f44f642d1d8
import {localData, serverData} from '../services/DataService';
import MedicationInventory  from '../components/MedicationInventory';
import Medication from '../models/Medication';
import Container from '../components/Container';
import {stringDate} from '../util/Date';
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
      todayDate: stringDate(new Date()),
      upstreamSyncing: false, // Should be set before server calls to declare what kind of syncing
    };
    
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

<<<<<<< HEAD
  MedicationInventoryForm = t.struct({
    drugName: t.String, // drug name
    quantity: t.int,
    dosage: t.int,
    units: t.String,
    comments: t.maybe(t.String)
  });

  formOptions = {
    fields: {
      drugName: {
        editable: true,
      },
      quantity: {
        multiline: false,
      },
      dosage: {
        multiline: false,
      },
      units: {
        multiline: false,
      },
      comments: {
        multiline: true,
      },
    }
  }

=======
>>>>>>> e20195c4dd3d452c52ba20e6cb220f44f642d1d8
  // TODO
  saveModal = (medication) => {
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

  // TODO
<<<<<<< HEAD
  // Sync up tablet first with server before grabbing medications
=======
  // Sync up tablet first with server before grabbing statuses
>>>>>>> e20195c4dd3d452c52ba20e6cb220f44f642d1d8
  syncAndLoadMedications = () => {
    this.props.setLoading(true);
    //this.props.isUploading(false);
    this.props.clearMessages();
    this.props.setLoading(false);
<<<<<<< HEAD
    // TODO
=======
    /// TODO
>>>>>>> e20195c4dd3d452c52ba20e6cb220f44f642d1d8
  }


  render() {

<<<<<<< HEAD
=======

>>>>>>> e20195c4dd3d452c52ba20e6cb220f44f642d1d8
    //TODO update rows
    return (
      <Container>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medication Inventory</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationInventory
            rows={[]}
            saveModal={this.saveModal}
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