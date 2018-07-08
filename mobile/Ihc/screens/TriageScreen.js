import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import {localData, serverData} from '../services/DataService';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';
import Container from '../components/Container';
import Button from '../components/Button';
import TriageLabsWheel from '../components/TriageLabsWheel';

export default class TriageScreen extends Component<{}> {
  /**
   * Expected props:
   * patientKey
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    this.startingFormValues = {
      labsDone: false,
      urineTestDone: false,
      date: this.props.todayDate || stringDate(new Date())
    };

    // Hold objects including a test's name, options, and result (int that
    // indexes into the options array)
    // TODO: replace with real tests and options once we get the template
    // and also update the Triage models on mobile and server side
    const labTestObjects = {
      blood: TriageLabsWheel.createLabTestObject('blood', ['N/a', 'Good', 'Bad']),
      nitrites: TriageLabsWheel.createLabTestObject('nitrites', ['N/a', 'Good', 'Bad']),
    };

    this.state = {
      formValues: this.startingFormValues,
      formType: Triage.getFormType(this.startingFormValues, 2),
      gender: 2, // 1: male, 2: female
      loading: false,
      errorMsg: null,
      successMsg: null,
      todayDate: this.startingFormValues.date,
      labTestObjects: labTestObjects
    };
  }

  // TODO: any other styling? multiline fields needed?
  options = {
    fields: {
      statusClarification: {label: 'Status clarification (if picked Other)'},
      labsDone: {label: 'Did they get labs done?'},
      date: {
        editable: false,
      }
    },
  }

  // to set the triage form correctly depending on gender
  loadPatient = () => {
    this.setState({ loading: true });
    try {
      const patient = localData.getPatient(this.props.patientKey);
      this.setState({
        gender: patient.gender,
        loading: false
      });
      // Call loadFormValues here, or else gender state isn't propogated like
      // expected
      this.loadFormValues(patient.gender);
    } catch(err) {
      this.setState({ errorMsg: err.message, loading: false });
    }
  }

  // Load existing Triage info if it exists
  loadFormValues = (gender) => {
    this.setState({ loading: true });
    const triage = localData.getTriage(this.props.patientKey, this.state.todayDate);
    if (!triage) {
      this.setState({
        loading: false,
        formType: Triage.getFormType(this.startingFormValues, gender)
      });
      return;
    }

    this.setState({
      formType: Triage.getFormType(triage, gender),
      formValues: triage,
      loading: false,
      labTestObjects: this.getLabTestObjects(triage)
    });
  }

  // From an existing triage form, properly update the lab test objects with the
  // existing values
  getLabTestObjects = (triage) => {
    const labTestObjectsCopy = Object.assign({}, this.state.labTestObjects);
    // For each test, set the result field of the labTestObject to the proper
    // index of the options array
    for(const [testName,test] of Object.entries(labTestObjectsCopy)) {
      if(!triage[testName]){
        // If there is no value yet for that test, then skip it
        continue;
      }
      test.result = test.options.indexOf(triage[testName]);
      if(test.result === -1) {
        throw new Error(`${test} does not contain string option ${triage[testName]}`);
      }
    }
    return labTestObjectsCopy;
  }

  componentDidMount() {
    this.loadPatient();
  }

  onFormChange = (value) => {
    this.setState({
      formType: Triage.getFormType(value, this.state.gender),
      formValues: value,
    });
  }

  completed = () => {
    this.setState({loading: true});
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(this.props.patientKey, this.state.todayDate,
        'triageCompleted', new Date().getTime());
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    serverData.updateStatus(statusObj)
      .then( () => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.state.loading) {
          this.setState({
            successMsg: 'Triage marked as completed, but not yet submitted',
            errorMsg: null,
            loading: false
          });
        }
      })
      .catch( (e) => {
        if(this.state.loading) {
          localData.markPatientNeedToUpload(this.props.patientKey);
          this.setState({
            successMsg: null,
            errorMsg: `${e.message}. Try to UploadUpdates`,
            loading: false
          });
        }
      });
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }

    this.setState({
      loading: true,
      errorMsg: null,
      successMsg: null,
    });

    const form = this.refs.form.getValue();
    const triage = Triage.extractFromForm(form, this.props.patientKey, this.state.labTestObjects);

    try {
      localData.updateTriage(triage);
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    this.setState({
      successMsg: 'Triage updated successfully',
      errorMsg: null,
      loading: false
    });
  }

  gotoMedications = () => {
    this.props.navigator.push({
      screen: 'Ihc.MedicationScreen',
      title: 'Back to triage',
      passProps: { name: this.props.name, patientKey: this.props.patientKey }
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

  // Takes in the test name and the string result
  updateLabTests = (name,result) => {
    const oldTests = Object.assign({}, this.state.labTestObjects);
    oldTests[name].result = result;
    this.setState(oldTests);
  }

  render() {
    return (
      <Container loading={this.state.loading}
        errorMsg={this.state.errorMsg}
        successMsg={this.state.successMsg}
        setLoading={this.setLoading}
        setMsg={this.setMsg}
        patientKey={this.props.patientKey}
      >

        <Text style={styles.title}>
          Triage
        </Text>

        <View style={styles.form}>
          <Form ref='form'
            type={this.state.formType}
            value={this.state.formValues}
            options={this.options}
            onChange={this.onFormChange}
          />

          {
            this.state.formValues.labsDone ?
              (
                <TriageLabsWheel
                  updateLabResult={this.updateLabTests}
                  tests = {Object.values(this.state.labTestObjects)}
                />
              ) : null
          }

          <Button onPress={this.gotoMedications}
            text='Mark Medications' />

          <Button onPress={this.completed}
            text='Triage completed' />

          <Button onPress={this.submit}
            text='Update' />

        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: '80%',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
