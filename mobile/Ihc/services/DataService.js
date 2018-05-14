/* global global */
// Returns either FakeData or RealData depending on config file
// Config file:
//   "dataService" : "FakeDataService" | "RealDataService"
import * as fakeData from '../services/FakeDataService';
import * as realData from '../services/RealDataService';
import config from '../config.json';

// Tests should use the FakeDataService to avoid complexity with Realm in the
// tests. Probably better to stub out FakeDataService method calls instead of
// rely on the FakeDataService though.
// console.log("Global test variable should be true: " + global.__TEST__);
let dataService = (config.dataService === 'FakeDataService' || global.__TEST__) ? fakeData : realData;
export default dataService;
