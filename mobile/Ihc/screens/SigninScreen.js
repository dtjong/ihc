import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
  View
} from 'react-native';
import {formatDate} from '../util/Date';
var t = require('tcomb-form-native');
var Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Patient from '../models/Patient';
import Container from '../components/Container';

export default class SigninScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {newPatient: false},
      formType: this.Signin,
      successMsg: null,
      errorMsg: null,
      loading: false
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
    const type = value.newPatient ? this.NewPatient : this.Signin;
    this.setState({ formValues: value, formType: type });
  }

  submit = () => {
    // TODO: The Birthday field seems to return a value that is a day later than
    // the one entered
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    this.setState({loading: true});
    const form = this.refs.form.getValue();
    const patient = Patient.extractFromForm(form);

    if(form.newPatient) {
      try {
        // Create patient should also add a new status object to the patient
        // that should propogate to the server call
        localData.createPatient(patient);
      } catch(e) {
        this.setState({errorMsg: e.message, successMsg: null, loading: false});
        return;
      }

      serverData.createPatient(patient)
        .then( () => {
          this.setState({
            // Clear form, reset to Signin form
            formValues: {newPatient: false},
            formType: this.Signin,
            successMsg: `${patient.firstName} added successfully`,
            errorMsg: null,
            loading: false
          });
        })
        .catch( (e) => {
          // If server update fails, mark the patient as need to upload
          // and give a message to syncronize with UploadUpdates
          this.setState({
            errorMsg: `${e.message}. Try to UploadUpdates`,
            successMsg: null,
            loading: false
          });

          localData.markPatientNeedToUpload(patient.key);
        });

      return;
    }

    // If not a new patient
    let statusObj = {};
    try {
      statusObj = localData.signinPatient(patient);
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null, loading: false});
      return;
    }

    serverData.updateStatus(statusObj)
      .then( () => {
        this.setState({
          // Clear form, reset to Signin form
          formValues: {newPatient: false},
          formType: this.Signin,
          successMsg: `${patient.firstName} signed in successfully`,
          errorMsg: null,
          loading: false
        });
      })
      .catch( (e) => {
        // If server update fails, mark the patient as need to upload
        // and give a message to syncronize with UploadUpdates
        this.setState({
          errorMsg: `${e.message}. Try to UploadUpdates`,
          successMsg: null,
          loading: false
        });

        localData.markPatientNeedToUpload(patient.key);
      });
  }

  render() {
    return (
      <Container loading={this.state.loading}
        errorMsg={this.state.errorMsg}
        successMsg={this.state.successMsg} >

        <Text style={styles.title}>
          Signin
        </Text>

        <View style={styles.form}>
          <Form ref='form' type={this.state.formType}
            value={this.state.formValues}
            options={this.options}
            onChange={this.onFormChange}
          />

          <Button onPress={this.submit}
            title='Submit' />
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
