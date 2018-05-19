import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {stringDate} from '../util/Date';

export default class MedicationTable extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    refill, change functions
   *    updates: [DrugUpdate obj, ...]
   *    dateToUpdates: {date: [DrugUpdate objs with that date]}
   *    drugNames: [drugNames]
   *  }
   */
  // TODO: only take in updates prop and calculate dateToUpdates and drugNames
  // here
  // TODO start with empty column for current date
  constructor(props) {
    super(props);
    this.state = { todayDate: stringDate(new Date()) };
  }

  // Returns the update with that name, or null if not found
  // updates: Array of update objects
  // name: string of drug name
  updateWithName(updates, name) {
    return updates.find( (update) => {
      return update.name === name;
    });
  }

  renderRow(updates, name, columnIndex, rowIndex) {
    let update = this.updateWithName(updates, name);
    if(!update) {
      update = {
        dose: '',
        frequency: '',
        duration: '',
        notes: ''
      };
    }

    return (
      <Row style={styles.row} key={`col${columnIndex}row${rowIndex}`}>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.dose}</Text></Col>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.frequency}</Text></Col>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.duration}</Text></Col>
        <Col style={styles.notesCol}><Text style={styles.text}>{update.notes}</Text></Col>
      </Row>
    );
  }

  // Row order should follow names array
  renderColumn(date, updates, names, i) {
    // Empty column
    if (!updates) {
      return (
        <Col style={styles.fullCol} key={'emptycol'}>
          <Row style={styles.headerRow}><Text>{this.state.todayDate}</Text></Row>
          <Row style={styles.row}><Text>No medications for today</Text></Row>
        </Col>
      );
    }

    const rows = names.map( (name, rowIndex) => {
      return this.renderRow(updates, name, i, rowIndex);
    });

    return (
      <Col style={styles.fullCol} key={`col${i}`}>
        <Row style={styles.headerRow}><Text>{date}</Text></Row>
        {rows}  
      </Col>
    );
  }

  /*
   * Take in updates for most recent date, and drug names
   */
  /* eslint-disable react-native/no-inline-styles */
  renderButtonColumn(updates, names) {
    const rows = names.map( (name, i) => {
      const update = this.updateWithName(updates, name);
      const exists = Boolean(update);
      const disableButton = !exists || update.date === this.state.todayDate;
      return (
        <Row style={styles.row} key={`buttonRow${i}`}>
          <TouchableOpacity
            style={[styles.buttonContainer, disableButton && {opacity: 0.5}]}
            onPress={() => this.props.refill(update)}
            disabled={disableButton}>
            <Text style={styles.button}>R</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => this.props.change(update)}>
            <Text style={styles.button}>C</Text>
          </TouchableOpacity>
        </Row>
      );
    });

    return (
      <Col style={styles.nameColumn}>
        <Row style={styles.headerRow}><Text>Actions</Text></Row>
        {rows}
      </Col>
    );
  }
  /* eslint-enablereact-native/no-inline-styles */

  /*
   * Input the leftmost date
   * We want the medications from the last checkup to be the ones potentially
   * refilled. Thus, we want to save that date. However, when there are updates,
   * that leftmost date will change to be today. We don't want to use today as
   * the date though, so use the next value.
   */
  mostRecentDate(dates) {
    if (dates[0] !== this.state.todayDate || !dates[1]) {
      return dates[0];
    }
    return dates[1];
  }

  render() {
    if (!this.props.drugNames.size || !Object.keys(this.props.dateToUpdates).length) {
      return (
        <View style={styles.container}>
          <Text style={styles.emptyText}>No data to show</Text>
        </View>
      );
    }

    const names = Array.from(this.props.drugNames).sort();
    const nameColumn = names.map( (name,i) => {
      return (
        <Row style={styles.row} key={`name${i}`}><Text>{name}</Text></Row>
      );
    });

    const dates = Object.keys(this.props.dateToUpdates).sort().reverse();
    // Insert empty column for todays date if it doesn't exist
    // Empty column should be less confusing for pharmacists
    // i.e. they can just refill the leftmost medications without having to
    // check the date
    if (dates[0] !== this.state.todayDate) {
      dates.splice(0, 0, this.state.todayDate); 
    }

    const updateColumns = dates.map( (date, i) => {
      return this.renderColumn(date, this.props.dateToUpdates[date], names, i);
    });

    const mostRecentDate = this.mostRecentDate(dates);
    const buttonColumn = this.renderButtonColumn(this.props.dateToUpdates[mostRecentDate],
      names);

    // Render row for header, then render all the rows
    return (
      <Grid>
        <Col style={styles.nameColumn}>
          <Row style={styles.headerRow}><Text>Drug name</Text></Row>
          {nameColumn}
        </Col>
        {buttonColumn}
        {updateColumns}
      </Grid>
    );
  }
}

/*
 * Files that create a renderRow() function should use these styles for
 * consistency
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
  },
  headerRow: {
    maxHeight: 20,
    backgroundColor: '#dbdbdb',
    borderWidth: 1
  },
  row: {
    height: 60,
    backgroundColor: '#dddddd',
    borderWidth: 1
  },
  notesCol: {
    minWidth: 150,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  smallCol: {
    minWidth: 60,
    maxWidth: 60,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  fullCol: {
    minWidth: 250,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  nameColumn: {
    minWidth: 100,
    maxWidth: 100,
    backgroundColor: '#adada0',
    borderWidth: 1
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    margin: 2,
    padding: 4,
    elevation: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
  button: {
    fontWeight: '500',
    color: '#fefefe',
    textAlign: 'center',
  }
});
