import 'react-native';
import React from 'react';
import SoapScreen from '../screens/SoapScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {localData} from '../services/DataService';
import sinon from 'sinon';
import Soap from '../models/Soap';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly', () => {
  sinon.stub(localData, 'getSoap').returns(Soap.getInstance());
  const json = renderer.create(
    <Provider store={store}>
      <SoapScreen todayDate='20180101' />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
