/* global */
// Returns either fakeLocalData or RealData depending on config file
// Config file:
// "FakeDataServices": "true" or "false"
import * as fakeLocalData from '../services/FakeLocalDataService';
import * as localDataService from '../services/LocalDataService';

import * as fakeServerData from '../services/FakeServerDataService';
import * as serverDataService from '../services/ServerDataService';

import config from '../config.json';

// Dont use the Fakes in tests, so that we can test the LocalDataService itself,
// but should stub out its methods for the other tests
let localData = (config.fakeDataServices === 'true') ? fakeLocalData : localDataService;
let serverData = (config.fakeDataServices === 'true') ? fakeServerData : serverDataService;
/*
let localData = (config.fakeDataServices === 'true' || global.__TEST__) ? fakeLocalData : localDataService;
let serverData = (config.fakeDataServices === 'true' || global.__TEST__) ? fakeServerData : serverDataService;
*/
export {localData, serverData};
