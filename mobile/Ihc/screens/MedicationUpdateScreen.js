import React, { Component } from 'react';
import {
  StyleSheet,
  Button,
  Text,
  View
} from 'react-native';
var t = require('tcomb-form-native');
var Form = t.form.Form;
import {localData} from '../services/DataService';
import DrugUpdate from '../models/DrugUpdate';
import Container from '../components/Container';

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
      localData.createDrugUpdate(update);
      this.props.navigator.pop();
    } catch(e) {
      this.setState({errorMsg: e.message});
    }
  }

  render() {
    return (
      <Container errorMsg={this.state.errorMsg} >
        <Text style={styles.title}>
          {this.props.action === 'new' ? 'New Medication' : 'Update Medication'}
        </Text>

        <View style={styles.form}>
          <Form ref="form" type={this.DrugUpdateForm}
            value={this.state.formValues}
            options={this.formOptions}
          />

          <Button onPress={this.submit}
            title="Submit" />
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
});
