import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList
} from 'react-native';
import {localData, serverData} from '../services/DataService';

export default class MedicationHistory extends Component {
  render() {
    let medicationRequests = localData.getPatientMedicationRequests(this.props.patientKey);
    let patient = localData.getPatient(this.props.patientKey);

    console.log("requests", medicationRequests);
    return(
      <View>
        <Text style={styles.title}>
          Medication Request History
        </Text>
        <FlatList
          data= {medicationRequests}
          extraData={this.props}
          renderItem={({item}) => 
            <View>
              <Text>
                {(""+item.medicationRequested + " Requested on:" + item.dateRequested)}
              </Text>
            </View>
          }
        />
      </View>
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
