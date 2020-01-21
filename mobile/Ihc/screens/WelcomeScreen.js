import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import Button from '../components/Button';
import { downstreamSyncWithServer } from '../util/Sync';
import MenuItem from '../components/MenuItem';


class newWelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.id == 'willAppear') {
            this.upload();
            this.download();
        }
    }

    goToSignin = () => {
        this.props.navigator.push({
            screen: 'Ihc.PatientCheckIn',
            title: 'Patient Check In',
        });
    }

    goToSelectPatient = () => {
        this.props.navigator.push({
            screen: 'Ihc.PatientList',
            title: 'Select patient'
        });
    }

    goToMedicationInventory = () => {
        this.props.navigator.push({
            screen: 'Ihc.MedicationInventoryScreen',
            title: 'Medication Inventory'
        });
    }

    upload = () => {
        this.props.setLoading(true);
        this.props.isUploading(true);
        this.props.clearMessages();

        const patients = localData.getPatientsToUpload();
        serverData.updatePatients(patients)
            .then(() => {
                // View README: Handle syncing the tablet, point 3 for explanation
                if (this.props.loading) {
                    localData.markPatientsUploaded();
                    this.props.setLoading(false);
                    this.props.setSuccessMessage('Uploaded successfully');
                }
            })
            .catch(err => {
                if (this.props.loading) {
                    this.props.setLoading(false);
                    this.props.setErrorMessage(err.message);
                }
            });
    }

    download = () => {
        this.props.setLoading(true);
        this.props.isUploading(false);
        this.props.clearMessages();

        downstreamSyncWithServer()
            .then((failedPatientKeys) => {
                // View README: Handle syncing the tablet, point 3 for explanation
                if (this.props.loading) {
                    if (failedPatientKeys.length > 0) {
                        throw new Error(`${failedPatientKeys.length} patients failed to download. Try again`);
                    }

                    this.props.setLoading(false);
                    this.props.setSuccessMessage('Downloaded successfully');
                }
            })
            .catch(err => {
                if (this.props.loading) {
                    this.props.setLoading(false);
                    this.props.setErrorMessage(err.message);
                }
            });

    }

    render() {
        return (
            <Container >
              <View style = { styles.menuContainer } >
                <TouchableOpacity onPress = { this.goToSignin }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/CheckInPatient.png') }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress = { this.goToSelectPatient }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/PatientList.png') }
                  />
                </TouchableOpacity >
                <TouchableOpacity onPress = { this.goToSignin }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/Labs.png') }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress = { this.goToMedicationInventory }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/Pharmacy.png') }
                  />
                </TouchableOpacity >

              </View>
            </Container >
        );
    }
}


const styles = StyleSheet.create({
    menuContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 600,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 50,
        marginLeft: '10%'
    },
    TouchableOpacityStyle: {
        height: '50%',
        width: '50%',
    },
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    loading: state.loading
});

const mapDispatchToProps = dispatch => ({
    setLoading: val => dispatch(setLoading(val)),
    setErrorMessage: val => dispatch(setErrorMessage(val)),
    setSuccessMessage: val => dispatch(setSuccessMessage(val)),
    clearMessages: () => dispatch(clearMessages()),
    isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(newWelcomeScreen);
