import 'react-native';
import React from 'react';
import PatientSelectScreen from '../screens/PatientSelectScreen';

import Patient from '../models/Patient';
import Status from '../models/Status';
import {localData} from '../services/DataService';

import sinon from 'sinon';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  sinon.useFakeTimers(100);
  const patient = Patient.getInstance();
  const patient2 = Patient.getInstance();
  const statuses = [Status.newStatus(patient), Status.newStatus(patient2)];
  const columnOrder = ['name', 'birthday', 'checkinTime', 'triageCompleted',
    'doctorCompleted', 'pharmacyCompleted', 'notes', 'patientKey'];

  const rows = statuses.map((obj) => columnOrder.map( (key) => obj[key] ));

  sinon.stub(localData, 'getPatientSelectRows').returns(rows);

  const fakeNavigator = { setOnNavigatorEvent: (param) => {} };
  const json = renderer.create(
    <PatientSelectScreen navigator={fakeNavigator} />
  ).toJSON();
  expect(json).toMatchSnapshot();
});
