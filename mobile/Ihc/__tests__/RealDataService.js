import sinon from 'sinon';
import * as data from '../services/RealDataService';
import Realm, {mockObjects, mockCreate, mockWrite} from '../__mocks__/realm';

import Patient from '../models/Patient';
import Soap from '../models/Soap';
import DrugUpdate from '../models/DrugUpdate';

jest.mock('realm');
global.fetch = require('jest-fetch-mock')

describe('Download updates', () => {
  beforeEach(() => {
    fetch.resetMocks();
    Realm.mockClear();
    mockObjects.mockClear();
    mockCreate.mockClear();
  });

  it('handles 0 patients when no prior settings exist', done => {
    fetch.mockResponse({patients: []});
    mockObjects.mockImplementation(() => {
      return undefined;
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(mockCreate).toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(result).toEqual([true]);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('handles 0 patients when a prior settings exists', done => {
    fetch.mockResponse({patients: []});

    // Just need to return a Settings object with any value
    const settings = { lastSynced: 100 };
    mockObjects.mockImplementation(() => {
      return { '0': settings };
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(mockCreate).not.toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(settings.lastSynced).toEqual(now);
          expect(result).toEqual([true]);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('handles 1 newer patient with new SOAP when a prior settings exists', done => {
    const now = new Date().getTime();

    const oldPatient = Patient.getInstance(now - 100);
    const newPatient = Patient.getInstance(now - 10);
    const soap = Soap.getInstance();
    newPatient.soaps = [soap];

    fetch.mockResponse({patients: [newPatient]});

    const settings = { lastSynced: 100 };
    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return { '0': settings };
      else if(type === 'Patient') {
        const obj = {
          0: oldPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(result).toEqual([true, true]);
          expect(mockWrite).toHaveBeenCalled();
          expect(mockCreate).not.toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(settings.lastSynced).toEqual(now);
          expect(oldPatient).toEqual(newPatient);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('handles 1 newer patient with updated SOAP when no prior settings exists', done => {
    const now = new Date().getTime();

    const oldPatient = Patient.getInstance(now - 100);
    const newPatient = Patient.getInstance(now - 10);

    const oldSoap = Soap.getInstance();
    oldSoap.lastUpdated = now - 200;
    oldPatient.soaps = [oldSoap];

    const newSoap = Soap.getInstance();
    newSoap.lastUpdated = now - 50;
    newSoap.subjective = "Updated subjective";
    newPatient.soaps = [newSoap];

    fetch.mockResponse({patients: [newPatient]});

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return undefined;
      else if(type === 'Patient') {
        const obj = {
          0: oldPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(result).toEqual([true, true]);
          expect(mockWrite).toHaveBeenCalled();
          expect(mockCreate).toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(oldPatient).toEqual(newPatient);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('handles 1 newer patient with outdated SOAP when no prior settings exists', done => {
    const now = new Date().getTime();

    const oldPatient = Patient.getInstance(now - 100);
    const newPatient = Patient.getInstance(now - 10);

    const oldSoap = Soap.getInstance();
    oldSoap.lastUpdated = now - 200;
    oldPatient.soaps = [oldSoap];

    // Has same timestamp as old soap so shouldnt trigger an update
    const newSoap = Soap.getInstance();
    newSoap.lastUpdated = now - 200;
    newSoap.subjective = "Updated subjective";
    newPatient.soaps = [newSoap];

    fetch.mockResponse({patients: [newPatient]});

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return undefined;
      else if(type === 'Patient') {
        const obj = {
          0: oldPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(result).toEqual([true, false]);
          expect(mockWrite).toHaveBeenCalled();
          expect(mockCreate).toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(oldPatient).not.toEqual(newPatient);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('should not update 1 older patient with outdated SOAP when no prior settings exists', done => {
    const now = new Date().getTime();

    const existingPatient = Patient.getInstance(now - 100);
    const incomingPatient = Patient.getInstance(now - 1000);

    const existingSoap = Soap.getInstance();
    existingSoap.lastUpdated = now - 100;
    existingPatient.soaps = [existingSoap];

    // Has same timestamp as old soap so shouldnt trigger an update
    const incomingSoap = Soap.getInstance();
    incomingSoap.lastUpdated = now - 1000;
    incomingSoap.subjective = "Older subjective";
    incomingPatient.soaps = [incomingSoap];

    fetch.mockResponse({patients: [incomingPatient]});

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return undefined;
      else if(type === 'Patient') {
        const obj = {
          0: existingPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          expect(result).toEqual([true]);
          expect(mockWrite).toHaveBeenCalled();
          expect(mockCreate).toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(existingPatient).not.toEqual(incomingPatient);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });

  it('handles 3 newer patients and 2 older patient with multiple new DrugUpdates when a prior settings exists', done => {
    const now = 1000;
    // 500 and 800 should not be updated because it is not more recent than 800
    const existingPatients = [850, 900, 950, 500, 800].map( timestamp => { 
      const p = Patient.getInstance();
      p.key = "key&" + timestamp;

      // Incoming patients should be updated if they have been updated more
      // recently than 800
      p.lastUpdated = 800;
      return p;
    });

    const incomingPatients = [850, 900, 950, 500, 800].map( timestamp => { 
      const p = Patient.getInstance();
      p.key = "key&" + timestamp;
      p.lastUpdated = timestamp;

      const d = DrugUpdate.getInstance();
      d.frequency = "Updated freq";
      d.lastUpdated = timestamp;

      const d2 = DrugUpdate.getInstance();
      d2.name = "Advil";
      d2.frequency = "Updated duration";
      d2.lastUpdated = timestamp;
      p.medications= [d, d2];
      return p;
    });

    // Expected patients after function call
    // First three patients should be updated, last two shouldn't be
    const expectedPatients = [
      Object.assign({}, incomingPatients[0]),
      Object.assign({}, incomingPatients[1]),
      Object.assign({}, incomingPatients[2]),
      Object.assign({}, existingPatients[3]),
      Object.assign({}, existingPatients[4])
    ];

    fetch.mockResponse({patients: incomingPatients});

    const settings = { lastSynced: 100 };
    let counter = 0; // number of types realm.objects('Patient') has been called
    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return { '0': settings };
      else if(type === 'Patient') {
        // Create object of { '0': patient1, ... } etc.
        const obj = { 0: existingPatients[counter] };
        counter++;

        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    data.downloadUpdates()
        .then( result => {
          // Expect 1 true by default, and then 2 trues per patient because each
          // patient has 2 drug update objects that are being updated, and there
          // are 3 patients who should be updated because they are more recent
          // than the preexisting patient
          expect(result).toEqual([true, true, true, true, true, true, true]);
          expect(mockWrite).toHaveBeenCalled();
          expect(mockCreate).not.toHaveBeenCalledWith('Settings', {lastSynced: now});
          expect(settings.lastSynced).toEqual(now);
          expect(existingPatients).toEqual(expectedPatients);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
  });
});
