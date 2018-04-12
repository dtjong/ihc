import 'react-native';
import React from 'react';
import SoapScreen from '../screens/SoapScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import data from '../services/DataService';
import sinon from 'sinon';
import Soap from '../models/Soap';

it('renders correctly', () => {
  sinon.stub(data, 'getSoap').returns(Promise.resolve(Soap.getInstance()));
  const json = renderer.create(
    <SoapScreen todayDate='20180101' />
  ).toJSON();
  expect(json).toMatchSnapshot();
});