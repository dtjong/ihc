import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import TriageLabComponent from './TriageLabComponent';

export default class TriageLabsWheel extends Component<{}> {
  /* Props
   * updateLabResult: function that takes in a test name and the index option
   *   that was chosen i.e. test name of 'cholestrol' and chosen option index of
   *   0, which might correspond to an option like 'healthy'
   * tests: array of test objects, created using the static function below, that
   *   holds info about lab test results
   */
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.tests.map( test => {
          return (
            <TriageLabComponent
              name={test.name}
              options={test.options}
              onValueChange={
                (index) => {this.props.updateLabResult(test.name, index);}
              }
              key={`${test.name}lab`}
            />
          );
        })}
      </View>
    );
  }

  // Name of the test, options for the test results, result is the index of the
  // option selected
  static createLabTestObject(name, options, result = 0) {
    return {name, options, result};
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
