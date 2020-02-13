import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Modal,
  Alert,
  AppRegistry,
  TextInput,
  Switch,
  CheckBox,
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Soap from '../models/Soap';
import {stringDate} from '../util/Date';
import Container from '../components/Container';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';
import { Col, Grid } from 'react-native-easy-grid';
import Triage from '../models/Triage';
import { DataTable } from 'react-native-paper';
import TriageLabsWheel from '../components/TriageLabsWheel';
import TriageHistory from './TriageHistory';

const MU_UNICODE = '\u03bc';

class LabScreen extends Component<{}> {
  /*
   * Redux props:
   * loading: boolean
   * currentPatientKey: string
   *
   * Props:
   * name: patient's name for convenience
   * patientKey: string of patient's key
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    const todayDate = this.props.todayDate || stringDate(new Date());
    const labTestObjects = {
      glucose: TriageLabsWheel.createLabTestObject('glucose', 'glucose (mg/dL)',
        ['-', '100(+/-)', '250(+)', '500(++)', '1000(+++)', '>=2000(++++)']),
      bilirubin: TriageLabsWheel.createLabTestObject('bilirubin', 'bilirubin (mg/dL)',
        ['-', '1(+)', '2(++)', '4(+++)']),
      ketone: TriageLabsWheel.createLabTestObject('ketone', 'ketone (mg/dL)', ['-', '5(+/-)', '15(+)']),
      specificGravity: TriageLabsWheel.createLabTestObject('specificGravity', 'specific gravity',
        ['1.000', '1.005', '1.010', '1.015', '1.020', '1.025', '1.030']),
      blood: TriageLabsWheel.createLabTestObject('blood', 'blood',
        ['-', '+/-', '+', '5-10', `50 Ery/${MU_UNICODE}L`]),
      ph: TriageLabsWheel.createLabTestObject('ph', 'pH', ['5.0', '6.0', '6.5', '7.0', '7.5', '8.0', '9.0']),
      protein: TriageLabsWheel.createLabTestObject('protein', 'protein (mg/dL)', ['-', '5(+/-)', '15(+)']),
      uroglobin: TriageLabsWheel.createLabTestObject('uroglobin', 'uroglobin (mg/dL)',
        ['0.2', '1', '2', '4', '8', '12']),
      nitrites: TriageLabsWheel.createLabTestObject('nitrites', 'nitrites', ['-', '+']),
      leukocytes: TriageLabsWheel.createLabTestObject('leukocytes', `leukocytes (Leu/${MU_UNICODE}L)`,
        ['-', '15 (+/-)', '70(+)', '125(++)', '500(+++)'])
    };
    this.state = {
      formValues: {date: todayDate},
      todayDate: todayDate,
      hb: '',
      hba1c: '',
      bgl: 'Blood Glucose Level',
      fasting: false,
      pregnant: false,
      unitswitch: false,
      labTestObjects: labTestObjects,
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

  syncAndLoadFormValues = () => {
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    // Load existing SOAP info if it exists
    const soap = localData.getSoap(this.props.currentPatientKey, this.state.todayDate);
    if (soap) {
      this.setState({ formValues: soap });
    }

    // Attempt server download and reload information if successful
    downstreamSyncWithServer()
      .then( ( failedPatientKeys) => {
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          const soap = localData.getSoap(this.props.currentPatientKey, this.state.todayDate);
          if (soap) {
            this.setState({ formValues: soap });
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

  componentDidMount() {
    this.syncAndLoadFormValues();
  }

  loadPastTriages = () => {
    let patient = localData.getPatient(this.props.currentPatientKey);
    this.setState({patientTriages: patient.triages});
  }

  // Updates the timestamp that displays in the PatientSelectScreen
  // Doesn't actually save the SOAP form

  updateLabTests = (name, result, labTestObjects) => {
    const oldTests = Object.assign({}, labTestObjects);
    oldTests[name].result = result;
    this.setState(oldTests);
  }

  render() {
    return (
      <Container>
        <View style={styles.triagescreen}>
        <View style={styles.triagesection}>
          <Text style={styles.subtitle}>Labs</Text>
          <View style={styles.inputsection}>
            <Text style={{fontSize: 18, marginTop:12}}>Hb</Text>
            <Text style={{fontSize: 18, marginTop:25}}>HbA1c</Text>
            <Text style={{fontSize: 18, marginTop:25}}>Blood Glucose Level</Text>
          </View>
          <View style={styles.inputsection}>
            <TextInput
              style={styles.input, {width: 300}}
              onChangeText={(hb) => this.setState({hb})}
              value={this.state.hb}
            />
            <TextInput
              style={styles.input, {width: 300}}
              onChangeText={(hba1c) => this.setState({hba1c})}
              value={this.state.hba1c}
            />
            <TextInput
              style={styles.input, {width: 300}}
              onChangeText={(bloodglucose) => this.setState({bloodglucose})}
              value={this.state.bloodglucose}
            />
          </View>

          <View style={styles.inputsection, {flexDirection:'row', marginLeft: '17%', marginTop: 10}}>
            <Text style={{fontSize:20}}>Fasting?</Text>
            <CheckBox checked={this.state.fasting}/>
          </View>
          <View style={styles.inputsection, {flexDirection:'row', marginLeft: '10%', marginTop: 11}}>
            <Text style={{fontSize:20}}>Pregnant?</Text>
            <CheckBox checked={this.state.fasting}/>
          </View>

        </View>

        <View style={styles.triagesection}>
          <Text style={styles.subtitle, {marginBottom: 30, fontSize: 20, color:'#0055FF'}}>Urine Test</Text>
          <TriageLabsWheel
            enabled={true}
            updateLabResult={(name, result) =>
                this.updateLabTests(name, result, this.state.labTestObjects)}
            tests = {Object.values(this.state.labTestObjects)}
          />
        </View>
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
  expand: {
    borderColor: 'white',
    borderWidth: 2.0,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#0660ae',
  },
  gridContainer: {
    flex: 1,
    maxWidth: '80%',
    alignItems: 'center',
  },
  col: {
    alignItems: 'center',
  },
  triagescreen:{
    flexDirection: 'column',
    maxWidth: '100%',
  },
  triagesection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 50,
    flex:1,
    flexWrap: 'wrap'
  },
  inputsection: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 10,
    start: 100,
    alignItems: 'flex-start',
  },
  inputunitsection:{
    flexDirection: 'column',
    start: 0,
    maxWidth: 100,
    justifyContent: 'flex-start',
    padding: 10,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'left',
    margin: 2,
    color:'#0055FF'
  },
  units: {
    fontSize: 12,
    marginLeft: 20,
    height: 40,
    marginTop: 10,
  },
  button: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  input: {
    marginBottom: 10,
    width: 400,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  switch: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  }
});

// Redux
import { setLoading, setSuccessMessage, setErrorMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  currentPatientKey: state.currentPatientKey
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(LabScreen);

