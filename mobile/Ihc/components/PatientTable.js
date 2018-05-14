import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';

// TODO: Maybe rewrite with react-native-easy-grid?
export default class PatientTable extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    headers: [string],
   *    rows: [[data]],
   *    loading: boolean,
   *    renderRow: function
   *  }
   */
  constructor(props) {
    super(props);
  }

  renderHeader(data, keyFn) {
    const cols = data.map( (e,i) => (
      <View style={tableStyles.col} key={keyFn(i)}>
        <Text>{e}</Text>
      </View>
    ) );
    return (
      <View style={tableStyles.rowContainer} key={keyFn(cols.length)}>
        {cols}
      </View>
    );
  }

  render() {
    if (this.props.loading) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    // Render row for header, then render all the rows
    return (
      <ScrollView contentContainerStyle={tableStyles.scroller}>
        {this.renderHeader(this.props.headers, (i) => `header${i}`)}
        {this.props.rows.map( row => this.props.renderRow(row, (i) => `row${i}`) )}
      </ScrollView>
    );
  }
}

/*
 * Files that create a renderRow() function should use these styles for
 * consistency
 */
export const tableStyles = StyleSheet.create({
  scroller: {
    flex: 0,
    minWidth: '80%',
    backgroundColor: '#F5FCFF',
  },
  rowContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    minHeight: 32
  },
  col: {
    flex: 1,
    alignSelf: 'stretch',
    minWidth: 64
  }
});
