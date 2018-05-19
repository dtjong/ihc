import 'react-native';
import React from 'react';
import TriageScreen from '../screens/TriageScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import {localData} from '../services/DataService';
import Patient from '../models/Patient';
import Triage from '../models/Triage';

it('renders correctly', () => {
  sinon.useFakeTimers(100);
  sinon.stub(localData, 'getPatient').returns(Patient.getInstance());
  sinon.stub(localData, 'getTriage').returns(Triage.getInstance());

  const component = shallow(<TriageScreen todayDate='20180101'/>);
  expect(component).toMatchSnapshot();
});
