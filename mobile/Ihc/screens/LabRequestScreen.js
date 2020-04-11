import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    FlatList
} from 'react-native';
import { DataTable, Searchbar } from 'react-native-paper';
import Button from '../components/Button';
import Patient from '../models/Patient';
import { downloadLabRequests } from '../util/Sync';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import { stringDate } from '../util/Date';

class LabRequestScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstQuery: '',
            labRequests: [],
            isFetching: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    //sync and loads patients that are checked in
    syncAndLoadLabRequests = () => {
        console.log('syncing');
        //this.props.setLoading(true);
        this.props.clearMessages();
        const labRequests = localData.getLabRequestsToUpload(true);
        console.log("Lab requests:");
        console.log(labRequests);
        this.setState({ labRequests: labRequests });

        //downloadLabRequests()
            //.then((failedPatientKeys) => {
                //// View README: Handle syncing the tablet, point 3 for explanation
                //console.log("within downstream Sync");
                //if (this.props.loading) {
                    //if (failedPatientKeys.length > 0) {
                        //throw new Error(`${failedPatientKeys.length} lab requests didn't properly sync.`);
                    //}
                    //let newStatuses = localData.getStatuses(today);
                    //newStatuses = newStatuses.filter(obj => !(obj.soapCompleted && obj.triageCompleted));
                    //this.setState({ fullarr: newStatuses, arrQ: newStatuses });
                    //this.props.setLoading(false);
                //}
            //})
            //.catch(err => {
                //console.log('failure');
                //if (this.props.loading) {
                    //this.props.setLoading(false);
                    //this.props.setErrorMessage(err.message);
                //}
            //})
            //.finally(() => {
                //this.setState({ isFetching: false });
            //});

    }

    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.syncAndLoadLabRequests();
        }
    }

    //if num is 1, get triage
    //if num is 2, get soap
    //if num is 3, get Complete
    getStatus = (patient, num) => {
        return (patient[num] ? "Complete" : "");
    }



    goToPatient = ({ patientKey, name }) => {
    }

    filterPatients = () => {
    }

    deleteRequest = (key) => {
        localData.dequeueLabRequest(key);
        this.syncAndLoadLabRequests();
    }

    render() {
        return (<Container>
              <View style = {
                  { height: '100%', width: '100%' }}>
              <View>
                <Searchbar placeholder = "Search"
                onChangeText = {
                    query => {
                        this.setState({ firstQuery: query }, () => this.filterPatients());
                    }
                }
                value = { this.state.firstQuery }
                style = { styles.search }
                />
              </View>

              <View>
              <DataTable>
              <DataTable.Header>
                <DataTable.Title >
                  { `(${this.state.labRequests.length})  Requests` }
                </DataTable.Title>
                <DataTable.Title>
                  Request Type
                </DataTable.Title>
                <DataTable.Title>
                  Date Requested
                </DataTable.Title>
                <DataTable.Title>
                </DataTable.Title>
              </DataTable.Header>

              <SafeAreaView>
                <FlatList data = { this.state.labRequests }
                renderItem = {
                    ({ item }) => {
                        return ( <DataTable.Row key = { item.key }
                            onPress = {
                                () => this.goToPatient(item)
                            }>
                              <DataTable.Cell >
                                { Patient.fullName(localData.getPatient(item.patientKey)) }
                              </DataTable.Cell>
                              <DataTable.Cell >
                                { item.testType }
                              </DataTable.Cell>
                              <DataTable.Cell >
                                { item.dateRequested }
                              </DataTable.Cell>
                              <DataTable.Cell style = { styles.button }
                              onPress = {
                                  () => this.deleteRequest(item.key)
                              }>
                              <Text style = {
                                  { color: 'white', fontSize: 20 }
                              }>
                                Cancel Request
                              </Text>
                              </DataTable.Cell >
                            </DataTable.Row> );
                        }
                    }
                    keyExtractor = { item => item.patientKey }
                    onRefresh = {
                        () => {
                            this.setState({ isFetching: true }, () => this.syncAndLoadLabRequests());
                        }
                    }
                    refreshing = { this.state.isFetching }
                    />
                </SafeAreaView>
              </DataTable>
            </View>
          </View>
        </Container>
            );
        }
    }

    export const styles = StyleSheet.create({
        search: {
            marginTop: '3%',
            marginBottom: '2%',
            width: '60%',
            marginLeft: "2%",
        },
        button: {
            borderColor: 'white',
            borderWidth: 2.0,
            borderRadius: 10,
            justifyContent: 'center',
            backgroundColor: 'red',
        }
    });

    // Redux
    import { setLoading, clearMessages, setErrorMessage } from '../reduxActions/containerActions';
    import { connect } from 'react-redux';

    const mapStateToProps = state => ({
        loading: state.loading
    });

    const mapDispatchToProps = dispatch => ({
        setLoading: (val) => dispatch(setLoading(val)),
        clearMessages: () => dispatch(clearMessages()),
        setErrorMessage: val => dispatch(setErrorMessage(val)),
    });

    export default connect(mapStateToProps, mapDispatchToProps)(LabRequestScreen);

