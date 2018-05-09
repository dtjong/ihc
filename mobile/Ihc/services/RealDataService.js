// This file should hold all the fetch() calls to the Express server
// and the local database calls to the Realm DB
// TODO: Keep realm in sync with mongo
// All lastUpdated fields on mobile-side should be handled within this file.

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
import {stringDate} from '../util/Date';
import config from '../config.json';

// Must set the fetchUrl to the server's IP Address and Port
const fetchUrl = config.fetchUrl;

const realm = new Realm({
  schema: [Patient, Status, Soap, Triage, DrugUpdate, Settings],
  deleteRealmIfMigrationNeeded: true, // TODO: delete when done with dev
});

export function createPatient(patient) {
  return createPatientHelper(patient, realm, fetchUrl);
}

// Check that patient exists, and if so then create a status object for them
export function signinPatient(patientForm) {
  return signinPatientHelper(patientForm, realm, fetchUrl);
}

// field: Any of fields from Status.schema
// value: should match the type that the Status.schema says
export function updateStatus(patientKey, strDate, field, value) {
  return updateStatusHelper(patientKey, strDate, field, value, realm, fetchUrl);
}

export function createDrugUpdate(update) {
  return createDrugUpdateHelper(update, realm, fetchUrl);
}

export function updateSoap(update) {
  return updateSoapHelper(update, realm, fetchUrl);
}

// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
  return getSoapHelper(patientKey, strDate, realm, fetchUrl);
}

export function updateTriage(update) {
  return updateTriageHelper(update, realm, fetchUrl);
}

// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
  return getTriageHelper(patientKey, strDate, realm, fetchUrl);
}

export function getPatient(patientKey) {
  return getPatientHelper(patientKey, realm, fetchUrl);
}

/*
 * Return the statuses of the patients that are active and for this date
 */
export function getPatientSelectRows() {
  return getPatientSelectRowsHelper(realm, fetchUrl);
}

export function getMedicationUpdates(patientKey) {
  return getMedicationUpdatesHelper(patientKey, realm, fetchUrl);
}

export function uploadUpdates() {
  return uploadUpdatesHelper(realm, fetchUrl);
}

export function downloadUpdates() {
  return downloadUpdatesHelper(realm, fetchUrl);
}
