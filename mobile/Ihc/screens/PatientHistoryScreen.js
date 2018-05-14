import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import data from '../services/DataService';
import {formatDate} from '../util/Date';
import {shortDate} from '../util/Date';

/* TODO: 
 * Make changes in behavior for the cases that a soap form is submitted, 
 * but not a triage form and vice versa
*/

export default class PatientHistoryScreen extends Component<{}> {
  /*
   * Expects:
   *  {
   *    name: string, patient's name (for convenience)
   *    patientKey: string
   *  }
   */
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      loading: false,
      error: null
    };
  }

  loadPatient = () => {
    this.setState({ loading: true });
    data.getPatient(this.props.patientKey)
      .then( data => {
        this.setState({ patient: data, loading: false });
      })
      .catch( err => {
        this.setState({ error: err.message, loading: false });
      });
  }

  componentDidMount() {
    this.loadPatient();
  }

  goToSoap(date) {
  
    this.props.navigator.push({
      screen: 'Ihc.SoapScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, patientKey: this.props.patientKey, todayDate: date }
    });
  }

  goToTriage(date) { 
    this.props.navigator.push({
      screen: 'Ihc.TriageScreen',
      title: 'Back to patient',
      passProps: { patientKey: this.props.patientKey, todayDate: date }
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            Previous Visits
          </Text>
          <Text>Loading...</Text>
        </View>
      );
    }
    if (this.state.patient == null) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            Previous Visits
          </Text>
          <Text>Patient doesnt exist...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Previous Visits
        </Text>

        <View style={styles.gridContainer}>
          <Grid>
            <Col style={styles.col}>
              {this.state.patient.soaps.map( (soap, i) => 
                <Text key={i} style={styles.dateContainer}>{formatDate(new Date(shortDate(soap.date)))}</Text> )}
            </Col>

            <Col style={styles.col}>
              {this.state.patient.soaps.map( (soap, i) => 
                <TouchableOpacity key={i} style={styles.buttonContainer}
                  onPress={() => this.goToSoap(soap.date)}>
                  <Text style={styles.button}>SOAP</Text>
                </TouchableOpacity> ) }
            </Col>

            <Col style={styles.col}>
              {this.state.patient.soaps.map( (soap, i) => 
                <TouchableOpacity key={i} style={styles.buttonContainer}
                  onPress={() => this.goToTriage(soap.date)}>
                  <Text style={styles.button}>Triage</Text>
                </TouchableOpacity> ) }
            </Col>
          </Grid>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    maxWidth: '80%',
    alignItems: 'center',
  },
  col: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  },
  buttonContainer: {
    width: 150,
    margin: 10,
    padding: 8,
    elevation: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
  dateContainer: {
    width: 150,
    margin: 10,
    padding: 8,
    elevation: 4,
  },
  button: {
    fontWeight: '500',
    color: '#fefefe',
    textAlign: 'center',
  }
});
