import 'react-native';
import React from 'react';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import sinon from 'sinon';
import {localData} from '../services/DataService';
import Patient from '../models/Patient';

it('renders correctly', () => {
  sinon.stub(localData, 'getPatient').returns(Patient.getInstance());

  const json = renderer.create(
    <PatientHistoryScreen todayDate = '20180101' />
  ).toJSON();
  expect(json).toMatchSnapshot();
});
