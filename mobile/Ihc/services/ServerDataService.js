// This file should handle all the fetch() calls to the Express server
// Requires Promises because dealing with server requests

import config from '../config.json';
// Must set the fetchUrl to the server's IP Address and Port
const fetchUrl = config.fetchUrl;

// Server endpoint: post /patient
export function createPatient(patient) {
  return fetch(fetchUrl + '/patient', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient: patient
    })
  }).then(response => response.json())
    .then(json => {
      // status is false if the Network connection went through but there was
      // some kind of error when processing the request.
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/status/:date
export function updateStatus(statusObj) {
  return fetch(fetchUrl + `/patient/${statusObj.patientKey}/status/${statusObj.date}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: statusObj
    })
  }).then(response => response.json())
    .then(json => {
      // status is false if the Network connection went through but there was
      // some kind of error when processing the request. Throwing an error here
      // will lead to patient.needToUpload being marked as true
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/drugUpdate
export function createDrugUpdate(update) {
}

// Server endpoint: put /patient/:key/soap/:date
export function updateSoap(update) {
}

// Server endpoint: get /patient/:key/soap/:date
// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
}

// Server endpoint: put /patient/:key/triage/:date
export function updateTriage(update) {
}

// Server endpoint: get /patient/:key/triage/:date
// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
}

// Server endpoint: get /patient/:key
export function getPatient(patientKey) {
}

// Server endpoint: get /patient/:key/drugUpdates
export function getMedicationUpdates(patientKey) {
}

// Server endpoint: get /patients/statuses/:date
// Return the statuses of the patients that are active and for this date
export function getActiveStatuses() {
}

// Server endpoint: post /patients
export function updatePatients(patients) {
  return fetch(fetchUrl + '/patients/', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patients: patients
    }),
  }).then(() => {
    return Promise.resolve(true);
  }).catch(err => {
    return Promise.reject(err);
  });
}

// Server endpoint: get /patients/:timestamp
export function getUpdatedPatients(lastSynced) {
  return fetch(fetchUrl + '/patients/' + lastSynced)
    .then(response => response.json())
    .then(json => {
      const patients = json.patients;
      return Promise.resolve(patients);
    }).catch(err => {
      return Promise.reject(err);
    });
}
