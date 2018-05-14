// This file should handle all the fetch() calls to the Express server
// and the local database calls to the Realm DB
// All lastUpdated fields on mobile-side should be handled within these
// functions

import Patient from '../models/Patient';
import Status from '../models/Status';
import Soap from '../models/Soap';
import Triage from '../models/Triage';
import DrugUpdate from '../models/DrugUpdate';
import Settings from '../models/Settings';

import {createPatientHelper} from './functions/CreatePatient';
import {signinPatientHelper} from './functions/SigninPatient';
import {updateStatusHelper} from './functions/UpdateStatus';
import {updateSoapHelper} from './functions/UpdateSoap';
import {createDrugUpdateHelper} from './functions/CreateDrugUpdate';
import {getSoapHelper} from './functions/GetSoap';
import {getTriageHelper} from './functions/GetTriage';
import {getPatientHelper} from './functions/GetPatient';
import {getPatientSelectRowsHelper} from './functions/GetPatientSelectRows';
import {updateTriageHelper} from './functions/UpdateTriage';
import {getMedicationUpdatesHelper} from './functions/GetMedicationUpdates';
import {uploadUpdatesHelper} from './functions/UploadUpdates';
import {downloadUpdatesHelper} from './functions/DownloadUpdates';

import Realm from 'realm';
import config from '../config.json';

// Must set the fetchUrl to the server's IP Address and Port
const fetchUrl = config.fetchUrl;

const realm = new Realm({
  schema: [Patient, Status, Soap, Triage, DrugUpdate, Settings],
  deleteRealmIfMigrationNeeded: true, // TODO: delete when done with dev
});

// Server endpoint: post /patient
export function createPatient(patient) {
  return createPatientHelper(patient, realm, fetchUrl);
}

// Server endpoint: put /patient/:key/status/:date
// Check that patient exists locally, and if so then create a status object for them
export function signinPatient(patientForm) {
  return signinPatientHelper(patientForm, realm, fetchUrl);
}

// Server endpoint: put /patient/:key/status/:date
// field: Any of fields from Status.schema
// value: should match the type that the Status.schema says
export function updateStatus(patientKey, strDate, field, value) {
  return updateStatusHelper(patientKey, strDate, field, value, realm, fetchUrl);
}

// Server endpoint: put /patient/:key/drugUpdate
export function createDrugUpdate(update) {
  return createDrugUpdateHelper(update, realm, fetchUrl);
}

// Server endpoint: put /patient/:key/soap/:date
export function updateSoap(update) {
  return updateSoapHelper(update, realm, fetchUrl);
}

// Server endpoint: get /patient/:key/soap/:date
// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
  return getSoapHelper(patientKey, strDate, realm, fetchUrl);
}

// Server endpoint: put /patient/:key/triage/:date
export function updateTriage(update) {
  return updateTriageHelper(update, realm, fetchUrl);
}

// Server endpoint: get /patient/:key/triage/:date
// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
  return getTriageHelper(patientKey, strDate, realm, fetchUrl);
}

// Server endpoint: get /patient/:key
export function getPatient(patientKey) {
  return getPatientHelper(patientKey, realm, fetchUrl);
}

// Server endpoint: get /patient/:key/drugUpdates
export function getMedicationUpdates(patientKey) {
  return getMedicationUpdatesHelper(patientKey, realm, fetchUrl);
}

// Server endpoint: get /patients/statuses
// Return the statuses of the patients that are active and for this date
export function getPatientSelectRows() {
  return getPatientSelectRowsHelper(realm, fetchUrl);
}

// Server endpoint: post /patients
export function uploadUpdates() {
  return uploadUpdatesHelper(realm, fetchUrl);
}

// Server endpoint: get /patients/:timestamp
export function downloadUpdates() {
  return downloadUpdatesHelper(realm, fetchUrl);
}
