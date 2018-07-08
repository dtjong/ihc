import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import {localData, serverData} from '../services/DataService';
import DrugUpdate from '../models/DrugUpdate';
import Container from '../components/Container';
import Button from '../components/Button';

export default class MedicationUpdateScreen extends Component<{}> {
  /*
   * Take in an
   *   action: 'change' or 'new'
   *   drugUpdate: If action is 'change', then what is the old update info
   *   patientKey: what patient is this for
   */
  constructor(props) {
    super(props);
    this.state = {
      formValues: this.props.drugUpdate,
      errorMsg: null,
      loading: false,
      showRetryButton: false,
    };
  }

  DrugUpdateForm = t.struct({
    name: t.String, // drug name
    dose: t.String,
    frequency: t.String,
    duration: t.String,
    notes: t.maybe(t.String)
  });

  formOptions = {
    fields: {
      name: {
        editable: this.props.action === 'new'
      },
      notes: {
        multiline: true,
        numberOfLines: 5
      }
    }
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = Object.assign({}, this.refs.form.getValue());

    const update = DrugUpdate.extractFromForm(form, this.props.patientKey);

    try {
      localData.updateDrugUpdate(update);
    } catch(e) {
      this.setState({errorMsg: e.message});
      return;
    }

    // Upload to server
    this.setState({loading: true});
    serverData.updateDrugUpdate(update)
      .then( () => {
        if(this.state.loading) {
          // if successful, then pop screen
          this.props.navigator.pop();
        }
      })
      .catch( (e) => {
        if(this.state.loading) {
          localData.markPatientNeedToUpload(this.props.patientKey);
          this.setState({
            errorMsg: e.message,
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
      <Container errorMsg={this.state.errorMsg} 
        loading={this.state.loading}
        setLoading={this.setLoading}
        setMsg={this.setMsg}
        patientKey={this.props.patientKey}
        showRetryButton={this.state.showRetryButton} >

        <Text style={styles.title}>
          {this.props.action === 'new' ? 'New Medication' : 'Update Medication'}
        </Text>

        <View style={styles.form}>
          <Form ref="form" type={this.DrugUpdateForm}
            value={this.state.formValues}
            options={this.formOptions}
          />

          <Button onPress={this.submit}
            style={styles.submitButton}
            text="Submit" />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: 400,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  submitButton: {
    width: '100%'
  }
});
