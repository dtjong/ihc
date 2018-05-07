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

import Realm from 'realm';
import {stringDate} from '../util/Date';

const realm = new Realm({
  schema: [Patient, Status, Soap, Triage, DrugUpdate, Settings],
  deleteRealmIfMigrationNeeded: true, // TODO: delete when done with dev
});

export function createPatient(patient) {
  try {
    const timestamp = new Date().getTime();
    const patientObjs = realm.objects('Patient').filtered('key = "' + patient.key + '"');
    const existingPatient = patientObjs['0'];

    if(existingPatient) {
      throw new Error("Patient already exists");
    }

    // Also sign them in
    const statusObj = Status.newStatus(patient);

    statusObj.lastUpdated = timestamp;
    patient.lastUpdated = timestamp;

    realm.write(() => {
      patient.statuses = [statusObj];
      realm.create('Patient', patient);
    });
    return Promise.resolve(true);
  } catch (e) {
    return Promise.reject(e);
  }
}

// Check that patient exists, and if so then create a status object for them
export function signinPatient(patientForm) {
  try {
    const key = Patient.makeKey(patientForm);
    const patientObjs = realm.objects('Patient').filtered('key = "' + key + '"');
    const patient = patientObjs['0'];
    if(!patient) {
      throw new Error("Patient doesn't exist");
    }
    if(Object.keys(patientObjs).length > 1) {
      throw new Error("More than one patient with key" + patientForm.key);
    }

    const timestamp = new Date().getTime();
    const statusObj = Status.newStatus(patientForm);
    statusObj.lastUpdated = timestamp;

    for ( var k in patient.statuses ){
      if(patient.statuses[k].date === statusObj.date) {
        throw new Error("This patient already checked in");
      }
    }

    realm.write(() => {
      patient.statuses.push(statusObj);
    });
    return Promise.resolve(true);
  } catch (e) {
    return Promise.reject(e);
  }
}

// field: Any of fields from Status.schema
// value: should match the type that the Status.schema says
export function updateStatus(patientKey, strDate, field, value) {
  try {
    const statusObjs = realm.objects('Status').filtered('patientKey = "'
      + patientKey + '" AND date = "' + strDate + '"');
    const statusObj = statusObjs['0'];
    if(!statusObj) {
      throw new Error("Status doesn't exist");
    }

    const patient = realm.objects('Patient').filtered('key = "' + patientKey + '"')['0'];
    if(!patient) {
      return Promise.reject(new Error('Patient does not exist'));
    }

    const timestamp = new Date().getTime();

    realm.write(() => {
      statusObj[field] = value;
      statusObj.lastUpdated = timestamp;
      patient.lastUpdated = timestamp;
    });
    return Promise.resolve(true);
  } catch (e) {
    return Promise.reject(e);
  }
}

export function createDrugUpdate(update) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];
    if(!patient) {
      throw new Error("Patient doesn't exist");
    }

    const timestamp = new Date().getTime();
    update.lastUpdated = timestamp;

    realm.write(() => {
      patient.lastUpdated = timestamp;
      // If an object for that drug and date already exists, update it
      for (var m in patient.medications) {
        const old = patient.medications[m];
        if(old.date === update.date && old.name === update.name) {
          old.dose = update.dose;
          old.frequency = update.frequency;
          old.duration = update.duration;
          old.notes = update.notes;
          old.lastUpdated = update.lastUpdated;
          return Promise.resolve(true);
        }
      }

      // If doesn't exist, then add it
      patient.medications.push(update);
    });
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}

export function updateSoap(update) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];

    if(!patient) {
      throw new Error("Patient doesn't exist");
    }

    const timestamp = new Date().getTime();
    update.lastUpdated = timestamp;

    const soap = realm.objects('Soap').filtered('date = "' +
        stringDate(new Date) + '" AND patientKey = "' + update.patientKey +
        '"')['0'];

    realm.write(() => {
      patient.lastUpdated = timestamp;
      // If an object for that date already exists, update it
      if(soap) {
        const properties = Object.keys(Soap.schema.properties);
        properties.forEach( p => {
          soap[p] = update[p];
        });
        soap.lastUpdated = new Date().getTime();
        return Promise.resolve(true);
      }

      // If doesn't exist, then add it
      patient.soaps.push(update);
    });
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}

// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
  const soap = realm.objects('Soap').filtered('date = "' +
      stringDate(new Date) + '" AND patientKey = "' + patientKey + '"')['0'];
  return Promise.resolve(soap);
}

export function updateTriage(update) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];

    if(!patient) {
      throw new Error("Patient doesn't exist");
    }

    const triage = realm.objects('Triage').filtered('date = "' +
        stringDate(new Date) + '" AND patientKey = "' + update.patientKey +
        '"')['0'];

    const timestamp = new Date().getTime();
    update.lastUpdated = timestamp;

    realm.write(() => {
      patient.lastUpdated = timestamp;
      // If an object for that date already exists, update it
      if(triage) {
        const properties = Object.keys(Triage.schema.properties);
        properties.forEach( p => {
          triage[p] = update[p];
        });
        triage.lastUpdated = new Date().getTime();
        return Promise.resolve(true);
      }

      // If doesn't exist, then add it
      patient.triages.push(update);
    });
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}

// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
  const triage = realm.objects('Triage').filtered('date = "' +
      stringDate(new Date) + '" AND patientKey = "' + patientKey + '"')['0'];
  return Promise.resolve(triage);
}

export function getPatient(patientKey) {
  const patient = realm.objects('Patient').filtered('key = "' + patientKey + '"');
  if(!patient) {
    return Promise.reject(new Error('Patient does not exist'));
  }
  return Promise.resolve(patient['0']);
}

export function getPatients() {
  return realm.objects('Patient');
}

/*
 * Return the statuses of the patients that are active and for this date
 */
export function getPatientSelectRows() {
  const statuses = Object.values(realm.objects('Status').filtered('date = "' +
      stringDate(new Date) + '" AND active = true').sorted('checkinTime'));

  const columnOrder = ['name', 'birthday', 'checkinTime', 'triageCompleted',
    'doctorCompleted', 'pharmacyCompleted', 'notes', 'patientKey'];
  const toReturn = createMatrix(statuses, columnOrder);

  return Promise.resolve(toReturn);
}

export function getMedicationUpdates(patientKey) {
  const updates = Object.values(realm.objects('DrugUpdate').filtered('patientKey = "' +
      patientKey + '"'));
  return Promise.resolve(updates);
}

export function uploadUpdates() {
  // const patients = Object.values(realm.objects('Patient').filtered('needToUpload = true'));
  const patients = Object.values(realm.objects('Patient'));
  // TODO: Fetch call to server
  fetch('route/', {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patients: patients
    }),
  }).then(response => {
    return Promise.resolve(true);
  }).catch(err => {
    return Promise.reject(err);
  });
}

export function downloadUpdates() {
  let settings = realm.objects('Settings');
  settings = settings ? settings['0'] : undefined;

  const lastSynced = settings ? settings.lastSynced : 0;

  // TODO: Fetch call to server, passing in lastSynced value
  return fetch('route/' + lastSynced)
    .then(response => {
      const patients = response.body.patients;
      return handleDownloadedPatients(patients, settings);
    }).catch(err => {
      return Promise.reject(err);
    });
}

/**
 * Returns array of Promises. Should be one promise for each updated object that
 * resolves to true, plus one additional promise that is there by default to
 * avoid an error in case no objects were updated. 
 * No promise is added if incomingPatient is ignored because it is older
 * than existingPatient
 */
function handleDownloadedPatients(patients, settings) {
  // Give array at least one promise to resolve
  const promises = [Promise.resolve(true)];

  try {
    patients.forEach( incomingPatient => {

      const existingPatient = realm.objects('Patient')
        .filtered('key = "' + incomingPatient.key + '"')['0'];

      if(!existingPatient) {
        throw new Error("Patient with key " + incomingPatient.key
          + " doesnt exist. This shouldnt have happened...");
      }

      if (incomingPatient.lastUpdated <= existingPatient.lastUpdated) {
        // Don't need to update
        // TODO: If incomingPatient.lastUpdated < existingPatient.lastUpdated, then
        // probably means this tablet didn't send their updates to the server...
        // Send some kind of message?
        return;
      }

      // TODO update existing Patient object itself in case changes were made
      // there

      incomingPatient.soaps.forEach(incomingSoap => {
        promises.push(updateObject(existingPatient, 'soaps', incomingSoap));
      });
      incomingPatient.triages.forEach(incomingTriage => {
        promises.push(updateObject(existingPatient, 'triages', incomingTriage));
      });
      incomingPatient.medications.forEach(incomingDrugUpdate => {
        promises.push(updateObject(existingPatient, 'medications',
            incomingDrugUpdate));
      });
      incomingPatient.statuses.forEach(incomingStatus => {
        promises.push(updateObject(existingPatient, 'statuses', incomingStatus));
      });

      // Update that patient's updated timestamp
      realm.write(() => {
        existingPatient.lastUpdated = incomingPatient.lastUpdated;
      });
    });

    realm.write(() => {
      if(!settings) {
        realm.create('Settings', {lastSynced: new Date().getTime()})
        return;
      }
      settings.lastSynced = new Date().getTime();
    });

    return Promise.all(promises);

  } catch (e) {
    return Promise.reject(e);
  }
}

function createMatrix(data, columnOrder) {
  return data.map((obj) => columnOrder.map( (key) => obj[key] ));
}

/**
 * Type: string of either 'soaps', 'triages', 'medications', or 'statuses'
 * Returns true Promise if updated successfully, false if wasn't updated
 */
function updateObject(existingPatient, type, incomingObject) {
  // Find existing form/object that corresponds to the incoming one
  let existingObject = {};
  if (type === 'medications') {
    existingObject = existingPatient.medications.find( med => {
      return incomingObject.date === med.date && incomingObject.name === med.name;
    });
  } else {
    existingObject = existingPatient[type].find( obj => {
      return incomingObject.date === obj.date;
    });
  }
  try {
    // If old object doesn't exist, then just add the new object to the patient
    if(!existingObject) {
      realm.write(() => {
        existingPatient[type].push(incomingObject);
      });
      return Promise.resolve(true);
    }

    if(incomingObject.lastUpdated > existingObject.lastUpdated) {
      realm.write(() => {
        const properties = Object.keys(incomingObject);
        properties.forEach( p => {
          existingObject[p] = incomingObject[p];
        });
      });
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  } catch (e) {
    return Promise.reject(e);
  }
}
