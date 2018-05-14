import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
  ScrollView,
  View
} from 'react-native';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import data from '../services/DataService';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';

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
      error: '',
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
    data.getPatient(this.props.patientKey)
      .then( data => {
        this.setState({
          gender: data.gender,
          loading: false
        });
      })
      .catch(err => {
        this.setState({ error: err.message, loading: false });
      });
  }

  // Load existing Triage info if it exists
  loadFormValues = () => {
    this.setState({ loading: true });
    data.getTriage(this.props.patientKey, this.state.todayDate)
      .then( triage => {
        if (!triage) {
          this.setState({loading: false});
          return;
        }

        this.setState({
          formType: Triage.getFormType(triage, this.state.gender),
          formValues: triage,
          loading: false,
        });
      })
      .catch(err => {
        this.setState({ error: err.message, loading: false });
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
    data.updateStatus(this.props.patientKey, this.state.todayDate,
      'triageCompleted', new Date().getTime())
      .then( () => {
        this.setState({
          successMsg: 'Triage marked as completed, but not yet submitted',
          error: null
        });
      })
      .catch( (e) => {
        this.setState({error: e.message, successMsg: null});
      });
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    this.setState({successMsg: 'Loading...'});
    const form = this.refs.form.getValue();
    const triage = Triage.extractFromForm(form, this.props.patientKey);

    data.updateTriage(triage)
      .then( () => {
        this.setState({
          successMsg: 'Triage updated successfully',
          error: null
        });
      })
      .catch( (e) => {
        this.setState({error: e.message, successMsg: null});
      });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
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

          <Text style={styles.error}>
            {this.state.error}
          </Text>

          <Button onPress={this.completed}
            styles={styles.button}
            title='Triage completed' />

          <Button onPress={this.submit}
            styles={styles.button}
            title='Update' />

          <Text style={styles.success}>
            {this.state.successMsg}
          </Text>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: '80%',
  },
  container: {
    flex: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  success: {
    textAlign: 'center',
    color: 'green',
    margin: 10,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    margin: 10,
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
