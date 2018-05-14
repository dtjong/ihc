import app from '../src/app';
import request from 'supertest';
import sinon from 'sinon';
import 'sinon-mongoose';

import PatientModel from '../src/models/Patient';
import SoapModel from '../src/models/Soap';
import TriageModel from '../src/models/Triage';
import StatusModel from '../src/models/Status';

describe('Test GetSoap routes', () => {
  let mock = null;
  afterEach(() => {
    if(mock) {
      mock.restore();
    }
  });

  test('should return soap if exists', () => {
    const soap = { name: "Soap" };

    mock = sinon.mock(SoapModel)
      .expects('findOne').withArgs({patientKey: 'keythatexists', date: 'datethatexists'})
      .yields(null, soap);

    return request(app).get('/patient/keythatexists/soap/datethatexists')
      .expect({status: true, soap: soap});
  });
});

describe('Test GetStatus routes', () => {
  let mock = null;
  afterEach(() => {
    if(mock) {
      mock.restore();
    }
  });

  test('should return status of patient if exists', () => {
    const patientStatus = { patientStatus: "status" };

    mock = sinon.mock(StatusModel) 
      .expects('findOne').withArgs({patientKey: 'keythatexists', date: 'datethatexists'})
      .yields(null, patientStatus);

    return request(app).get('/patient/keythatexists/status/datethatexists')
      .expect({status: true, patientStatus: patientStatus})
  });
});

describe('Test GetStatuses route', () => {
  let mock = null;
  afterEach(() => {
    if(mock) {
      mock.restore();
    }
  });

  test('should return statuses for the given date', () => {
    const status1 = { patientKey: 'patientKey', date: 'datetahtexists' };
    mock = sinon.mock(StatusModel) 
      .expects('find').withArgs({date: 'datethatexists'})
      .yields(null, [status1]);

    return request(app).get('/patients/statuses/datethatexists')
      .expect({status: true, patientStatuses: [status1]})
  });
});

describe('Test GetPatient routes', () => {
  let mock = null;
  afterEach(() => {
    // Within this describe() block, we have multiple tests that mock the same
    // method, so we must restore() them to avoid conflicts
    if(mock) {
      mock.restore();
    }
  });

  test('should return patient if they exist', () => {
    const model = { firstName: "Test" };

    // Mocking prevents us from having to use the real database. We can
    // simulate the database and return fake, but relatively realistic, values
    // Here, the PatientModel.findOne() method normally passes (error, data)
    // to a callback function, so in this case we pass null for error, and our
    // fake model as the data.
    mock = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: 'keythatexists'})
      .yields(null, model);

    // Test the API route with the correct route, and expect whatever object
    // should be returned
    return request(app).get('/patient/keythatexists')
      .expect({status: true, patient: model});
  });

  test('should return error if no patient exists', () => {
    mock = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: 'keythatdoesntexist'})
      .yields(new Error("Patient with key keythatdoesntexist doesn\'t exist"), null);

    return request(app).get('/patient/keythatdoesntexist')
      .expect({status: false, error: 'Patient with key keythatdoesntexist doesn\'t exist'});
  });
});

//Alex
//testing getPatients
describe('Test GetPatients routes', ()=>{
  let mocks = [];
  afterEach(() => {
    // Within this describe() block, we have multiple tests that mock the same
    // method, so we must restore() them to avoid conflicts
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return success if GetPatients is successful', ()=>{
    //create fake patient
    const patient1 = {key: "THISISAFAKEKEY1", firstName: "Test1", lastName: "Test1", birthday: "20050621"};
    const patient2 = {key: "THISISAFAKEKEY2", firstName: "Test2", lastName: "Test2", birthday: "20050622"};
    const patient3 = {key: "THISISAFAKEKEY3", firstName: "Test3", lastName: "Test3", birthday: "20050623"};
    var patientList = [patient1, patient2, patient3];
    const mock1 = sinon.mock(PatientModel)
      .expects('find').withArgs({lastUpdated: { $gt: 12345 } })
      .yields(null, patientList);
    mocks.push(mock1);

    return request(app).get('/patients/12345')
      .expect({status: true, patients: patientList});
  });

  test('should return error message if error occurs', () => {
    const mock1 = sinon.mock(PatientModel)
      .expects('find').withArgs({lastUpdated: { $gt: 0 } })
      .yields(new Error("Error occurred"), null);
    mocks.push(mock1);

    return request(app).get('/patients/0')
      .expect({status: false, error: "Error occurred"});
  });

});

describe('Test CreatePatient routes', () => {
  let mocks = [];
  afterEach(() => {
    // Within this describe() block, we have multiple tests that mock the same
    // method, so we must restore() them to avoid conflicts
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return success if add is successful', () => {
    const patient = { key: "Test&Last&20110101", firstName: "Test", lastName: "Last", birthday: "20110101" };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: patient.key})
      .yields(null, null);
    mocks.push(mock1);

    const mock2 = sinon.mock(PatientModel)
      .expects('create').withArgs(patient)
      .yields(null);
    mocks.push(mock2);

    return request(app).post('/patient')
      .send({patient: patient})
      .expect({status: true});
  });

  test('should return error if patient with that key already exists', () => {
    const patient = { key: "Test&Last&20110101", firstName: "Test", lastName: "Last", birthday: "20110101" };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: patient.key})
      .yields(null, patient);
    mocks.push(mock1);

    return request(app).post('/patient')
      .send({patient: patient})
      .expect({status: false, error: "Patient already exists with that name and birthday. Use a different name"});
  });

  test('should return error if save fails', () => {
    const patient = { key: "Test&Last&20110101", firstName: "Test", lastName: "Last", birthday: "20110101" };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: patient.key})
      .yields(null, null);
    mocks.push(mock1);

    const mock2 = sinon.mock(PatientModel)
      .expects('create').withArgs(patient)
      .yields(new Error('Problems saving'));
    mocks.push(mock2);

    return request(app).post('/patient')
      .send({patient: patient})
      .expect({status: false, error: "Problems saving"});
  });
});

describe('Test UpdatePatient routes', () => {
  let mocks = [];
  afterEach(() => {
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return success if update is successful', () => {
    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      gender: 1,
      set: () => {},
      save: () => {},
      lastUpdated: new Date().getTime()
    };
    const newPatient = Object.assign({}, oldPatient);
    newPatient.gender = 2;
    newPatient.lastUpdated = oldPatient.lastUpdated + 1;

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock2 = sinon.mock(oldPatient)
      .expects('set').withArgs(newPatient);
    mocks.push(mock2);

    const mock3 = sinon.mock(oldPatient)
      .expects('save')
      .yields(null, newPatient);
    mocks.push(mock3);

    return request(app)
      .put('/patient/' + oldPatient.key)
      .send({patient: newPatient})
      .then(response => {
        expect(JSON.parse(response.text)).toEqual({status: true});
        expect(oldPatient.gender).toEqual(newPatient.gender);
        expect(oldPatient.lastUpdated).toEqual(newPatient.lastUpdated);
      });
  });

  test('should return error if update is unsuccessful', () => {
    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      set: () => {},
      save: () => {},
      lastUpdated: new Date().getTime()
    };
    const newPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110102",
      lastUpdated: oldPatient.lastUpdated + 1
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock2 = sinon.mock(oldPatient)
      .expects('set').withArgs(newPatient);
    mocks.push(mock2);

    const mock3 = sinon.mock(oldPatient)
      .expects('save')
      .yields(new Error("Problems saving"), null);
    mocks.push(mock3);

    return request(app).put('/patient/' + oldPatient.key)
      .send({patient: newPatient})
      .expect({status: false, error: "Problems saving"});
  });

  test('should return error if new patient is not up to date', () => {
    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      set: () => {},
      save: () => {},
      lastUpdated: new Date().getTime()
    };
    const newPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110102",
      lastUpdated: oldPatient.lastUpdated - 1
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    return request(app).put('/patient/' + oldPatient.key)
      .send({patient: newPatient})
      .expect({status: false, error: "Patient sent is not up-to-date. Sync required."});
  });
});

// TODO: Could use more comprehensive tests
describe('Test UpdatePatients routes', () => {
  let mocks = [];
  afterEach(() => {
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return correct values if all updates are successful', () => {
    const oldPatient1 = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      set: () => {},
      save: () => {},
      lastUpdated: 100
    };
    const soap = {patientKey: oldPatient1.key};

    const newPatient1 = Object.assign({}, oldPatient1);
    newPatient1.soaps= [soap];
    newPatient1.lastUpdated = oldPatient1.lastUpdated + 1;

    const newPatient2 = Object.assign({}, oldPatient1);
    newPatient2.key = 'NoPriorPatientExists';
    newPatient2.soaps= [soap];

    const oldPatient3 = Object.assign({}, oldPatient1);
    const newPatient3 = Object.assign({}, oldPatient1);
    newPatient3.key = 'ShouldCauseAnError';
    newPatient3.lastUpdated = oldPatient1.lastUpdated - 10;

    const mock1 = sinon.stub(PatientModel, 'findOne')
      .onCall(0).yields(null, oldPatient1)
      .onCall(1).yields(null, null)
      .onCall(2).yields(null, oldPatient3);
    mocks.push(mock1);

    const mock2 = sinon.stub(oldPatient1, 'set');
    mocks.push(mock2);

    const mock3 = sinon.mock(oldPatient1)
      .expects('save')
      .yields(null, newPatient1);
    mocks.push(mock3);

    const mock4 = sinon.stub(PatientModel, 'create').yields(null);
    mocks.push(mock4);

    return request(app).put('/patients')
      .send({patients: [newPatient1, newPatient2, newPatient3]})
      .expect({errors: ['Patient sent is not up-to-date. Sync required.'], updatedCount: 1, addedCount: 1});
  });
});

describe('Test UpdateSoap routes', () => {
  let mocks = [];
  afterEach(() => {
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return success if successfully updates existing Soap', () => {
    const oldSoap = {
      patientKey: "Test&Last&20110101",
      date: "20180101",
      subjective: 'old',
      objective: 'old',
      assessment: 'old',
      plan: 'old',
      wishlist: 'nothing',
      provider: 'doc',
      lastUpdated: 100
    };

    const newSoap = Object.assign({}, oldSoap);
    newSoap.lastUpdated = oldSoap.lastUpdated + 1;
    newSoap.subjective = 'new';

    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      soaps: [oldSoap],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock3 = sinon.mock(oldPatient)
      .expects('save')
      .yields(null);
    mocks.push(mock3);

    return request(app)
      .put('/patient/' + oldPatient.key + '/soap/' + newSoap.date)
      .send({soap: newSoap})
      .then(response => {
        expect(JSON.parse(response.text)).toEqual({status: true});
        expect(oldPatient.soaps).toEqual([newSoap]);
        expect(oldPatient.lastUpdated).toEqual(newSoap.lastUpdated);
      });
  });

  test('should return success if successfully adds new Soap', () => {
    const newSoap = {
      patientKey: "Test&Last&20110101",
      date: "20180101",
      subjective: 'new',
      objective: 'new',
      assessment: 'new',
      plan: 'new',
      wishlist: 'nothing',
      provider: 'doc',
      lastUpdated: 100
    };

    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      soaps: [],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock3 = sinon.mock(oldPatient)
      .expects('save')
      .yields(null);
    mocks.push(mock3);

    return request(app)
      .put('/patient/' + oldPatient.key + '/soap/' + newSoap.date)
      .send({soap: newSoap})
      .then(response => {
        expect(JSON.parse(response.text)).toEqual({status: true});
        expect(oldPatient.soaps).toEqual([newSoap]);
        expect(oldPatient.lastUpdated).toEqual(newSoap.lastUpdated);
      });
  });

  test('should return error if new soap is not up to date', () => {
    const oldSoap = {
      patientKey: "Test&Last&20110101",
      date: "20180101",
      subjective: 'old',
      objective: 'old',
      assessment: 'old',
      plan: 'old',
      wishlist: 'nothing',
      provider: 'doc',
      lastUpdated: 100
    };

    const newSoap = Object.assign({}, oldSoap);
    newSoap.lastUpdated = oldSoap.lastUpdated - 1;
    newSoap.subjective = 'new';

    const oldPatient = {
      key: "Test&Last&20110101",
      firstName: "Test",
      lastName: "Last",
      birthday: "20110101",
      soaps: [oldSoap],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    return request(app)
      .put('/patient/' + oldPatient.key + '/soap/' + oldSoap.date)
      .send({soap: newSoap})
      .expect({status: false, error: "Soap sent is not up-to-date. Sync required."});
  });
});

describe('Test UpdateStatus routes', () => {
  let mocks = [];
  afterEach(() => {
    for(let i in mocks) {
      mocks[i].restore();
    }
  });

  test('should return success if successfully updates existing status', () => {
    const oldStatus = {
      patientKey: "First&Last&20110101",
      name: "First Last",
      birthday: "20110101",
      date: "20180507",
      active: true,
      checkinTime: 12,
      triageCompleted: 0,
      doctorCompleted: 0,
      pharmacyCompleted: 0,
      notes: 'old',
      lastUpdated: 100
    };

    const newStatus = Object.assign({}, oldStatus);
    newStatus.lastUpdated = oldStatus.lastUpdated + 1;
    newStatus.notes = 'new';

    const oldPatient = {
      key: "First&Last&20110101",
      firstName: "First",
      lastName: "Last",
      birthday: "20110101",
      statuses: [oldStatus],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock2 = sinon.mock(oldPatient)
      .expects('save')
      .yields(null);
    mocks.push(mock2);

    return request(app)
      .put('/patient/' + oldPatient.key + '/status/' + newStatus.date)
      .send({status: newStatus})
      .then(response => {
        expect(JSON.parse(response.text)).toEqual({status: true});
        expect(oldPatient.statuses).toEqual([newStatus]);
      });
  });

  test('should return success if successfully adds new status', () => {
    const newStatus = {
      patientKey: "First&Last&20110101",
      name: "First Last",
      birthday: "20110101",
      date: "20180507",
      active: true,
      checkinTime: 12,
      triageCompleted: 0,
      doctorCompleted: 0,
      pharmacyCompleted: 0,
      notes: 'new',
      lastUpdated: 100
    };

    const oldPatient = {
      key: "First&Last&20110101",
      firstName: "First",
      lastName: "Last",
      birthday: "20110101",
      statuses: [],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    const mock2 = sinon.mock(oldPatient)
      .expects('save')
      .yields(null);
    mocks.push(mock2);

    return request(app)
      .put('/patient/' + oldPatient.key + '/status/' + newStatus.date)
      .send({status: newStatus})
      .then(response => {
        expect(JSON.parse(response.text)).toEqual({status: true});
        expect(oldPatient.statuses).toEqual([newStatus]);
      });
  });
  test('should return error if new status is not up to date', () => {
    const oldStatus = {
      patientKey: "First&Last&20110101",
      name: "First Last",
      birthday: "20110101",
      date: "20180507",
      active: true,
      checkinTime: 0,
      triageCompleted: 0,
      doctorCompleted: 0,
      pharmacyCompleted: 0,
      notes: 'old',
      lastUpdated: 100
    };

    const newStatus = Object.assign({}, oldStatus);
    newStatus.lastUpdated = oldStatus.lastUpdated - 1;
    oldStatus.notes = 'new'; 

    const oldPatient = {
      key: "First&Last&20110101",
      firstName: "First",
      lastName: "Last",
      birthday: "20110101",
      statuses: [oldStatus],
      save: () => {},
      lastUpdated: new Date().getTime()
    };

    const mock1 = sinon.mock(PatientModel)
      .expects('findOne').withArgs({key: oldPatient.key})
      .yields(null, oldPatient);
    mocks.push(mock1);

    return request(app)
      .put('/patient/' + oldPatient.key + '/status/' + newStatus.date)
      .send({status: newStatus})
      .expect({status: false, error: "Status sent is not up-to-date. Sync required."});
  });
});
