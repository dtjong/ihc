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
import DrugUpdate from '../models/DrugUpdate';

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
      error: '',
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

    data.createDrugUpdate(update)
      .then( () => {
        // Go back to previous page
        this.props.navigator.pop();
      })
      .catch( (e) => {
        this.setState({error: e.message});
      });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {this.props.action === 'new' ? 'New Medication' : 'Update Medication'}
        </Text>

        <View style={styles.form}>
          <Form ref="form" type={this.DrugUpdateForm}
            value={this.state.formValues}
            options={this.formOptions}
          />

          <Text style={styles.error}>
            {this.state.error}
          </Text>

          <Button onPress={this.submit}
            title="Submit" />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: 400,
  },
  container: {
    flex: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
