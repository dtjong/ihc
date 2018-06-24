import { Navigation } from 'react-native-navigation';

import { registerScreens } from './screens';
import config from './config.json';

registerScreens(); // this is where you register all of your app's screens

if (config.testingServerDataService === 'true' ) {
  // Test server data service with buttons that call service
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'Ihc.TestServerScreen',
      title: 'Test',
      navigatorStyle: {},
      navigatorButtons: {}
    },
    passProps: {},
    animationType: 'slide-down'
  });
} else {
  // start the app
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'Ihc.WelcomeScreen',
      title: 'Welcome',
      navigatorStyle: {},
      navigatorButtons: {}
    },
    passProps: {},
    animationType: 'slide-down'
  });
}
