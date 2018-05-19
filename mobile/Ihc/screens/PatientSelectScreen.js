import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {localData} from '../services/DataService';
import PatientTable, {tableStyles} from '../components/PatientTable';
import Container from '../components/Container';
import {shortDate} from '../util/Date';

export default class PatientSelectScreen extends Component<{}> {
  constructor(props) {
    super(props);

    this.rowNum = 0;
    this.tableHeaders = ['Name', 'Birthday', 'Checkin', 'Triage', 'Doctor',
      'Pharmacy', 'Notes'];
    this.state = {
      loading: false,
      rows: [],
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  loadPatients = () => {
    this.setState({ loading: true });
    const data = localData.getPatientSelectRows();
    this.setState({ rows: data, loading: false });
  }

  // Reload table after moving back to table
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.loadPatients();
    }
  }

  componentDidMount() {
    this.loadPatients();
  }

  goToPatient = (patient) => {
    this.props.navigator.push({
      screen: 'Ihc.PatientHomeScreen',
      title: patient.name,
      passProps: { name: patient[0], patientKey: patient[7] }
    });
  }

  renderRow = (data, keyFn) => {
    // e is the current element
    const cols = data.map( (e,i) => (
      <View style={tableStyles.col} key={keyFn(i)}>
        {( () => {
          // TODO: format birthday, add ability to add notes
          switch(i) {
            case 1: // birthday
              return <Text>{shortDate(e)}</Text>;
            case 2: // checkin time
            case 3: // triage time
            case 4: // doctor time
            case 5: // pharmacy time
              // No time provided
              if(!e)
                return <Text></Text>;
              const time = new Date(e);
              // TODO: update checkintime format
              return <Text>{`${time.getHours()}:${time.getMinutes()}`}</Text>;
            case 7: // patient Key
              return;
            default:
              return <Text>{e}</Text>;
          }
        })() }
      </View>
    ) );
    return (
      <TouchableOpacity style={tableStyles.rowContainer}
        key={`row${this.rowNum++}`} onPress={() => this.goToPatient(data)}>
        <View style={tableStyles.rowContainer} key={keyFn(cols.length)}>
          {cols}
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Container loading={this.state.loading}>
        <Text style={styles.title}>
          Select a Patient
        </Text>

        <PatientTable
          headers={this.tableHeaders}
          rows={this.state.rows}
          loading={this.state.loading}
          renderRow={this.renderRow}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
