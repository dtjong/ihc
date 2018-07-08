import { Navigation } from 'react-native-navigation';

import WelcomeScreen from './WelcomeScreen';
import SigninScreen from './SigninScreen';
import PatientSelectScreen from './PatientSelectScreen';
import PatientHomeScreen from './PatientHomeScreen';
import MedicationScreen from './MedicationScreen';
import MedicationUpdateScreen from './MedicationUpdateScreen';
import GrowthChartScreen from './GrowthChartScreen';
import SoapScreen from './SoapScreen';
import TriageScreen from './TriageScreen';
import PatientHistoryScreen from './PatientHistoryScreen';
import TestServerScreen from './TestServerScreen';

// register all screens of the app (including internal ones)
export function registerScreens() {
  // All ID names should be Ihc.<Component Name>
  Navigation.registerComponent('Ihc.WelcomeScreen', () => WelcomeScreen);
  Navigation.registerComponent('Ihc.SigninScreen', () => SigninScreen);
  Navigation.registerComponent('Ihc.PatientSelectScreen', () => PatientSelectScreen);
  Navigation.registerComponent('Ihc.PatientHomeScreen', () => PatientHomeScreen);
  Navigation.registerComponent('Ihc.MedicationScreen', () => MedicationScreen);
  Navigation.registerComponent('Ihc.GrowthChartScreen', () => GrowthChartScreen);
  Navigation.registerComponent('Ihc.MedicationUpdateScreen', () => MedicationUpdateScreen);
  Navigation.registerComponent('Ihc.SoapScreen', () => SoapScreen);
  Navigation.registerComponent('Ihc.TriageScreen', () => TriageScreen);
  Navigation.registerComponent('Ihc.PatientHistoryScreen', () => PatientHistoryScreen);
  Navigation.registerComponent('Ihc.TestServerScreen', () => TestServerScreen);
}
