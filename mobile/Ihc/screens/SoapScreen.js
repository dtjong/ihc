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
import Soap from '../models/Soap';
import {stringDate} from '../util/Date';

export default class SoapScreen extends Component<{}> {
  /*
   * Props:
   * name: patient's name for convenience
   * patientKey: string of patient's key
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    const todayDate = this.props.todayDate || stringDate(new Date());
    this.state = {
      formValues: {date: todayDate},
      error: '',
      todayDate: todayDate,
    };
  }

  // TODO: Make form fields larger, more like textarea
  Soap = t.struct({
    date: t.String,
    subjective: t.maybe(t.String),
    objective: t.maybe(t.String),
    assessment: t.maybe(t.String),
    plan: t.maybe(t.String),
    wishlist: t.maybe(t.String),
    provider: t.String // Doctor's name
  });

  formOptions = {
    fields: {
      date: {
        editable: false,
      },
      subjective: {
        multiline: true,
      },
      objective: {
        multiline: true,
      },
      assessment: {
        multiline: true,
      },
      plan: {
        multiline: true,
      },
      wishlist: {
        multiline: true,
      },
    }
  }

  // Load existing SOAP info if it exists
  loadFormValues = () => {
    this.setState({ loading: true });
    data.getSoap(this.props.patientKey, this.state.todayDate)
      .then( soap => {
        if (!soap) {
          this.setState({loading: false});
          return;
        }

        this.setState({
          formValues: soap,
          loading: false
        });
      })
      .catch(err => {
        this.setState({ error: err.message, loading: false });
      });
  }

  componentDidMount() {
    this.loadFormValues();
  }

  completed = () => {
    data.updateStatus(this.props.patientKey, this.state.todayDate,
      'doctorCompleted', new Date().getTime())
      .then( () => {
        this.setState({
          successMsg: 'Soap marked as completed, but not yet submitted',
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
    const soap = Soap.extractFromForm(form, this.props.patientKey);

    data.updateSoap(soap)
      .then( () => {
        this.setState({
          successMsg: 'SOAP updated successfully',
          error: null
        });
      })
      .catch( (e) => {
        this.setState({error: e.message, successMsg: null});
      });
  }

  // Need this to update formValues so that after clicking completed button,
  // form doesn't reset... IDK why :(
  onFormChange = (value) => {
    this.setState({
      formValues: value,
    });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Soap
        </Text>

        <View style={styles.form}>
          <Form ref="form"
            type={this.Soap}
            value={this.state.formValues}
            options={this.formOptions}
            onChange={this.onFormChange}
          />

          <Text style={styles.error}>
            {this.state.error}
          </Text>

          <Button onPress={this.completed}
            styles={styles.button}
            title="Soap completed" />

          <Button onPress={this.submit}
            styles={styles.button}
            title="Update" />

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
