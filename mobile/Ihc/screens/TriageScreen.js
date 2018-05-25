import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
  View
} from 'react-native';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import {localData, serverData} from '../services/DataService';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';
import Container from '../components/Container';

export default class TriageScreen extends Component<{}> {
  /**
   * Expected props:
   * patientKey
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    const startingFormValues = {
      labsDone: false,
      urineTestDone: false,
      date: this.props.todayDate || stringDate(new Date())
    };

    this.state = {
      formValues: startingFormValues,
      formType: Triage.getFormType(startingFormValues, 2),
      gender: 2, // 1: male, 2: female
      loading: false,
      errorMsg: null,
      successMsg: null,
      disableLabs: false,
      disableUrine: false,
      todayDate: startingFormValues.date,
    };
  }

  // TODO: any other styling? multiline fields needed?
  options = {
    fields: {
      statusClarification: {label: 'Status clarification (if picked Other)'},
      pregnancyTest: {label: 'Pregnancy test positive?'},
      fasting: {label: 'Did this patient fast?'},
      urineTestDone: {label: 'Did they take a urine test?'},
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
    } catch(err) {
      this.setState({ errorMsg: err.message, loading: false });
      return;
    }
  }

  // Load existing Triage info if it exists
  loadFormValues = () => {
    this.setState({ loading: true });
    const triage = localData.getTriage(this.props.patientKey, this.state.todayDate);
    if (!triage) {
      this.setState({loading: false});
      return;
    }

    this.setState({
      formType: Triage.getFormType(triage, this.state.gender),
      formValues: triage,
      loading: false,
    });
  }

  componentDidMount() {
    this.loadPatient();
    this.loadFormValues();
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
        this.setState({
          successMsg: 'Triage marked as completed, but not yet submitted',
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

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    this.setState({successMsg: 'Loading...'});
    const form = this.refs.form.getValue();
    const triage = Triage.extractFromForm(form, this.props.patientKey);

    try {
      localData.updateTriage(triage);
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    this.setState({
      successMsg: 'Triage updated successfully',
      errorMsg: null
    });
  }

  render() {
    return (
      <Container loading={this.state.loading}
        errorMsg={this.state.errorMsg}
        successMsg={this.state.successMsg} >

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

          <Button onPress={this.completed}
            styles={styles.button}
            title='Triage completed' />

          <Button onPress={this.submit}
            styles={styles.button}
            title='Update' />

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
  button: {
    margin: 4,
  }
});
