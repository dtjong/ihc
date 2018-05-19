/* eslint-disable */
// WARNING: This file was just copied from FakeLocalDataService.js. If we end up
// using this file, then it should probably be changed

// This file should hold skeletons for the function calls from RealDataService.
// Implementation is not required because they should be stubbed out during
// tests
export function getPatient(patientKey) {
  return {};
}

export function getTriage(patientKey, date) {
  return {};
}

export function getSoap(patientKey, date) {
  return {};
}

export function getPatients(param) {
  return []; // Return whatever sample data you want
}

export function getUpdates(param) {
  return []; // Return whatever sample data you want
}

/*
 * active_only is true if we only want the statuses of patients that are
 * currently checked in
 */
export function getPatientSelectRows() {
  const arr =
    [
      newFakePatientSelectRow('Jose'),
      newFakePatientSelectRow('Bob'),
      newFakePatientSelectRow('Matt'),
      newFakePatientSelectRow('Coco'),
      newFakePatientSelectRow('Brandon'),
      newFakePatientSelectRow('Evan'),
      newFakePatientSelectRow('Sarah'),
      newFakePatientSelectRow('Daniel'),
      newFakePatientSelectRow('Neil'),
      newFakePatientSelectRow('William')
    ];

  const columnOrder = ['name', 'birthday', 'checkin_time', 'triage_completed',
    'doctor_completed', 'pharmacy_completed', 'notes'];
  const toReturn = createMatrix(arr, columnOrder);

  return new Promise((resolve, reject) => {
    setTimeout(resolve, 100, toReturn);
  });
}

export function getMedicationUpdates() {
  const arr = [
    newFakeMedicationUpdate('Tylenol'),
    newFakeMedicationUpdate('Tylenol'),
    newFakeMedicationUpdate('Advil'),
    newFakeMedicationUpdate('Aspirin'),
    newFakeMedicationUpdate('Aspirin'),
    newFakeMedicationUpdate('Aspirin'),
    newFakeMedicationUpdate('Cold meds'),
  ];

  return new Promise((resolve, reject) => {
    setTimeout(resolve, 100, arr);
  });
}

const medsCount = 0;
function newFakeMedicationUpdate(name) {
  medsCount = ++medsCount % 3;

  return {
    name: name,
    date: `2018020${medsCount}`,
    dose: '10mg',
    frequency: 'bid',
    duration: '1 month',
    notes: 'yes'
  };
}

const numFakePatients = 0;
// Currently ignore triage/doctor/pharmacy params
function newFakePatientSelectRow(name, triage = false, doctor = false,
  pharm = false, notes = '') {
  numFakePatients++;
  return {
    name: name,
    birthday: '20180201',
    checkin_time: new Date().getTime(),
    triage_completed: numFakePatients % 2 === 0 ? new Date().getTime() : null,
    doctor_completed: numFakePatients % 4 === 0 ? new Date().getTime() : null,
    pharmacy_completed: numFakePatients % 8 === 0 ? new Date().getTime() : null,
    notes: notes
  };
}

function createMatrix(data, columnOrder) {
  return data.map((obj) => columnOrder.map( (key) => obj[key] ));
}
/* eslint-enable */
