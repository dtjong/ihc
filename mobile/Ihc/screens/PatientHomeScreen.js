import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import Container from '../components/Container';
import Button from '../components/Button';

export default class PatientHomeScreen extends Component<{}> {
  /*
   * Expects:
   *  {
   *    name: string, patient's name (for convenience)
   *    patientKey: string
   *    todayDateString: optional, (new Date().toDateString()), helpful for
   *    tests
   *  }
   */
  constructor(props) {
    super(props);
  }

  goToTriage = () => {
    this.props.navigator.push({
      screen: 'Ihc.TriageScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, patientKey: this.props.patientKey }
    });
  }

  goToSoap = () => {
    this.props.navigator.push({
      screen: 'Ihc.SoapScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, patientKey: this.props.patientKey }
    });
  }

  goToMedicationList = () => {
    this.props.navigator.push({
      screen: 'Ihc.MedicationScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, patientKey: this.props.patientKey }
    });
  }

  goToHistory = () => {
    this.props.navigator.push({
      screen: 'Ihc.PatientHistoryScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, patientKey: this.props.patientKey }
    });
  }

  goToGrowthChart = () => {
    this.props.navigator.push({
      screen: 'Ihc.GrowthChartScreen',
      title: 'Back to patient',
      passProps: { patientKey: this.props.patientKey}
    });
  }

  render() {
    const date = new Date();
    //const dateString = `${date.getMonth()} ${date.getDate()}, ${date.getYear()}`;
    const dateString = this.props.todayDateString || date.toDateString();
    return (
      <Container >
        <Text style={styles.title}>
          {this.props.name}
        </Text>

        <Text style={styles.title}>
          {dateString}
        </Text>

        <View style={styles.gridContainer}>
          <Grid>
            <Col style={styles.col}>
              <Button onPress={this.goToTriage}
                style={styles.button}
                text='Triage' />

              <Button onPress={this.goToSoap}
                style={styles.button}
                text='SOAP' />

              <Button onPress={this.goToMedicationList}
                style={styles.button}
                text='Medications' />
            </Col>

            <Col style={styles.col}>
              <Button onPress={this.goToHistory}
                style={styles.button}
                text='History' />

              <Button onPress={this.goToGrowthChart}
                style={styles.button}
                text='Growth Chart' />
            </Col>
          </Grid>
        </View>
      </Container>
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
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  },
  button: {
    width: '80%'
  }
});
