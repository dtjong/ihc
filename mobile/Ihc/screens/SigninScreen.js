import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
  ScrollView,
  View
} from 'react-native';
import {formatDate} from '../util/Date';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import data from '../services/DataService';
import Patient from '../models/Patient';

export default class SigninScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {newPatient: false},
      formType: this.Signin,
      error: '',
    };
  }

  Signin = t.struct({
    firstName: t.String,
    fatherName: t.String,
    motherName: t.String,
    birthday: t.Date,
    newPatient: t.Boolean,
  });

  Gender = t.enums({
    Male: 'Male',
    Female: 'Female',
  });

  // Signin fields + whatever else a new patient needs
  NewPatient = t.struct({
    firstName: t.String,
    fatherName: t.String,
    motherName: t.String,
    birthday: t.Date,
    newPatient: t.Boolean,
    gender: this.Gender,
    phone: t.maybe(t.String),
    fatherHeight: t.maybe(t.Number),
    motherHeight: t.maybe(t.Number),
  });

  options = {
    fields: {
      motherName: {label: 'Mother\'s last name'},
      fatherName: {label: 'Father\'s last name'},
      birthday: {
        label: 'Birthday',
        mode: 'date',
        config: {
          format: formatDate,
          dialogMode: 'spinner'
        }
      },
      newPatient: {label: 'New patient?'},
    }
  }

  // If new patient button is clicked, then show extra fields
  onFormChange = (value) => {
    if(value.newPatient !== this.state.formValues.newPatient) {
      const type = value.newPatient ? this.NewPatient : this.Signin;
      this.setState({ formValues: value, formType: type });
    }
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();

    if(form.newPatient) {
      const patient = Patient.extractFromForm(form);
      data.createPatient(patient)
        .then( () => {
          this.setState({
            // Clear form, reset to Signin form
            formValues: {newPatient: false},
            formType: this.Signin,
            successMsg: `${patient.firstName} added successfully`,
            error: null
          });
        })
        .catch( (e) => {
          this.setState({error: e.message, successMsg: null});
        });
    } else {
      const patient = Patient.extractFromForm(form);
      data.signinPatient(patient)
        .then( () => {
          this.setState({
            // Clear form, reset to Signin form
            formValues: {newPatient: false},
            formType: this.Signin,
            successMsg: `${patient.firstName} signed in successfully`,
            error: null
          });
        })
        .catch( (e) => {
          this.setState({formValues: form, error: e.message, successMsg: null});
        });
    }
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Signin
        </Text>

        <View style={styles.form}>
          <Form ref='form' type={this.state.formType}
            value={this.state.formValues}
            options={this.options}
            onChange={this.onFormChange}
          />

          <Text style={styles.error}>
            {this.state.error}
          </Text>

          <Button onPress={this.submit}
            title='Submit' />

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
});
