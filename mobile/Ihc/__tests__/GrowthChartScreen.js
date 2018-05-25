import 'react-native';
import React from 'react';
import GrowthChartScreen from '../screens/GrowthChartScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {localData} from '../services/DataService';
import sinon from 'sinon';
import Patient from '../models/Patient';

it('renders correctly', () => {
  const patient = Patient.getInstance();
  patient.growthChartData = { weights: [[1,10], [2,20]], heights: [[1,10], [2,20]] };
  sinon.stub(localData, 'getPatient').returns(patient);
  const json = renderer.create(
    <GrowthChartScreen />
  ).toJSON();
  expect(json).toMatchSnapshot();
});
