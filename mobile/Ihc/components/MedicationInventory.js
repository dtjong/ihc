import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {shortDate} from '../util/Date';
import NewMedicationModal from './NewMedicationModal';
import UpdateMedicationModal from './UpdateMedicationModal';
import Button from './Button';
import Medication from '../models/Medication'

export default class MedicationInventory extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [Medication],
   *    saveModal1: function
   *    saveModal2: function
   *  }
   */
  constructor(props) {
    super(props);
    this.tableHeaders = ['Drug Name', 'Quantity', 'Dosage', 'Units', 'Notes'];
    this.rowNum = 0;
    // showModal1 is the modal for new medication
    // showModal2 is the modal to edit medication
    // name is the name of the medication
    // medicationKey is the key of the medication we are editing in the Modal
    // medicationProps is an array of the medication properties
    this.state = {showModal1: false, showModal2: false, name: null, medicationKey: null, medicationProps: null, newMedication:null};
  }


  // Modal to add new medication
  openModal1 = () => {
    this.setState({showModal1: true});
  }
  closeModal1 = () => {
    this.setState({showModal1: false, newMedication: null});
  }

  addMedication = (newMedication) => {
    this.setState({newMedication: newMedication})
  }


  // Modal to edit existing medication
  openModal2 = (name, medicationKey, medicationProps) => {
    this.setState({showModal2: true, name: name, medicationKey: medicationKey, medicationProps: medicationProps});
  }

  closeModal2 = () => {
    this.setState({showModal2: false, name: null, medicationKey: null, medicationProps: null});
  }

  updateMedication = (newMedicationProps) => {
    this.setState({medicationProps: newMedicationProps});
  }

  renderCol = (element, keyFn, index) => {
  
    /*return (
      <Col style={styles.otherCol} size={2} key={keyFn(index)}>
        <Button style={styles.notes}
          onPress={() => this.openModal2(name, medicationKey)}
          textStyle={styles.notesText}
          text={element} />
      </Col>
    );*/
    return (
      <Col style={styles.otherCol} size={2} key={keyFn(index)}>
        <Text>{element}</Text>
      </Col>
    );
  }

  renderRow = (data, keyFn) => {
    /*let medData = Object.keys(data.properties).map(i => data.properties[i]);
    let medicationKey = medData.shift()    
    
    let cols = medData.map( (e,i) => {
      // Pass the patient key and name
      // to the render column fn to be passed to Update Modal
      return this.renderCol(e,keyFn,i);
    });
    
    medData.push(medicationKey)

    return (
      <Row key={`row${this.rowNum++}`} style={styles.rowContainer}>
      //onPress={() => this.openModal2(medData[0], medicationKey, medData)}>
        {cols}
      </Row>
    );*/
  }

  renderHeader(data, keyFn) {
    const cols = data.map( (e,i) => (
      <Col size={2} style={styles.otherCol} key={keyFn(i)}>
        <Text style={styles.text}>{e}</Text>
      </Col>
    ));

    return (
      <Row style={styles.headerRow}>
        {cols}
      </Row>
    );
  }

  render() {
    // Render row for header, then render all the rows
    return (
      <View style={styles.container}>

        <NewMedicationModal
          showModal={this.state.showModal1}
          closeModal={this.closeModal1}
          addMedication={this.addMedication}
          saveModal={() => this.props.saveModal1(newMedication)}
        />

        <UpdateMedicationModal
          showModal={this.state.showModal2}
          closeModal={this.closeModal2}
          saveModal={() => this.props.saveModal2(this.state.medicationKey, this.state.medicationProps)}
          updateMedication={this.updateMedication}
          medicationProps={this.state.medicationProps}
        />

        <Grid>
          {this.renderHeader(this.tableHeaders, (i) => `header${i}`)}
          {this.props.rows.map( row => this.renderRow(row, (i) => `row${i}`) )}
        </Grid>

        <Button style={styles.buttonContainer}
          onPress={this.openModal1}
          text='Add Medication' />
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 32
  },
  timestampCol: {
    maxWidth: 60,
    borderWidth: 1
  },
  notesCol: {
    borderWidth: 1,
  },
  birthdayCol: {
    borderWidth: 1,
  },
  otherCol: {
    borderWidth: 1
  },
  headerRow: {
    backgroundColor: '#dbdbdb',
    borderWidth: 1,
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
  notes: {
    height: '100%',
    width: '100%',
    backgroundColor: '#bebebe',
    borderRadius: 0,
    margin: 0
  },
  notesText: {
    fontWeight: 'normal',
    color: '#111'
  },
  buttonContainer: {
    width: 150,
    height: 40,
  },
});
