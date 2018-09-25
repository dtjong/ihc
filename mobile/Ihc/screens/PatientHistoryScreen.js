import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';
import {localData} from '../services/DataService';
import Container from '../components/Container';
import PatientHistoryTable from '../components/PatientHistoryTable';
import {downstreamSyncWithServer} from '../util/Sync';

/* TODO:
 * Make changes in behavior for the cases that a soap form is submitted,
 * but not a triage form and vice versa
*/

class PatientHistoryScreen extends Component<{}> {
  /*
   * Expects:
   *  {
   *    name: string, patient's name (for convenience)
   *  }
   */
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      patient: null,
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  /* Merges dates from both soaps and triages */
  compileDates = (soaps, triages) => {
    const dates = [];
    let i = 0;
    let j = 0;

    while (i < soaps.length && j < triages.length) {
      if (soaps[i].date < triages[j].date) {
        dates.push(soaps[i++].date);
      }
      else if (soaps[i].date > triages[j].date) {
        dates.push(triages[j++].date);
      } else {
        dates.push(soaps[i].date);
        i++;
        j++;
      }
    }

    while (i < soaps.length) {
      dates.push(soaps[i++].date);
    }

    while (j < triages.length) {
      dates.push(triages[j++].date);
    }

    return dates;
  }

  convertDataToRows = (dates, patient) => {
    const rows = [];
    let s = 0;
    let t = 0;

    for (let i = 0; i < dates.length; i++) {
      const row = {strDate: dates[i], soap: null, triages: null};

      if (s < patient.soaps.length) {
        if (dates[i] === patient.soaps[s].date) {
          row.soap = patient.soaps[s];
          s++;
        }
      }
      if (t < patient.triages.length) {
        if (dates[i] === patient.triages[t].date) {
          row.triages = patient.triages[t];
          t++;
        }
      }

      rows.push(row);
    }

    return rows;
  }

  syncAndLoadPatient = () => {
    this.props.setLoading(true);
    this.props.clearMessages();

    try {
      const patient = localData.getPatient(this.props.currentPatientKey);
      if (patient) {
        const dates = this.compileDates(patient.soaps, patient.triages);
        const rows = this.convertDataToRows(dates, patient);
        this.setState({ dates: dates, rows: rows });
      }
      this.setState({ patient: patient});
    } catch(err) {
      this.props.setLoading(false);
      this.props.setErrorMessage(err.message);
      return;
    }

    downstreamSyncWithServer()
      .then( (failedPatientKeys) => {
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          try {
            const patient = localData.getPatient(this.props.currentPatientKey);
            this.props.setLoading(false);
            this.setState({ patient: patient });
          } catch(err) {
            this.props.setLoading(false);
            this.props.setErrorMessage(err.message);
            return;
          }

          this.props.setLoading(false);
        }
      })
      .catch( (err) => {
        if (this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadPatient();
    }
  }

  goToSoap = (date) => {
    this.props.navigator.push({
      screen: 'Ihc.SoapScreen',
      title: 'Back to patient',
      passProps: { name: this.props.name, todayDate: date }
    });
  }

  goToTriage = (date) => {
    this.props.navigator.push({
      screen: 'Ihc.TriageScreen',
      title: 'Back to patient',
      passProps: { todayDate: date }
    });
  }

  render() {
    if (this.state.patient == null) {
      return (
        <Container>
          <Text style={styles.title}>
            Previous Visits
          </Text>
          <Text>Patient doesnt exist...</Text>
        </Container>
      );
    }

    return (
      <Container>
        <Text style={styles.title}>
          Previous Visits
        </Text>

        <PatientHistoryTable
          rows={this.state.rows}
          name={this.props.name}
          goToSoap={this.goToSoap}
          goToTriage={this.goToTriage}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  }
});

// Redux
import { setLoading, setSuccessMessage, setErrorMessage, clearMessages } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  currentPatientKey: state.currentPatientKey
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  clearMessages: () => dispatch(clearMessages())
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientHistoryScreen);
