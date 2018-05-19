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
import Soap from '../models/Soap';
import {stringDate} from '../util/Date';
import Container from '../components/Container';

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
      errorMsg: null,
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
    const soap = localData.getSoap(this.props.patientKey, this.state.todayDate);
    if (!soap) {
      this.setState({loading: false});
      return;
    }

    this.setState({
      formValues: soap,
      loading: false
    });
  }

  componentDidMount() {
    this.loadFormValues();
  }

  completed = () => {
    try {
      localData.updateStatus(this.props.patientKey, this.state.todayDate,
        'doctorCompleted', new Date().getTime());
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    this.setState({
      successMsg: 'Soap marked as completed, but not yet submitted',
      errorMsg: null
    });
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    this.setState({successMsg: 'Loading...'});
    const form = this.refs.form.getValue();
    const soap = Soap.extractFromForm(form, this.props.patientKey);

    try {
      localData.updateSoap(soap);
    } catch(e) {
      this.setState({errorMsg: e.message, successMsg: null});
      return;
    }

    this.setState({
      successMsg: 'SOAP updated successfully',
      errorMsg: null
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
      <Container loading={this.state.loading} errorMsg={this.state.errorMsg} 
        successMsg={this.state.successMsg}>

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

          <Button onPress={this.completed}
            styles={styles.button}
            title="Soap completed" />

          <Button onPress={this.submit}
            styles={styles.button}
            title="Update" />
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
