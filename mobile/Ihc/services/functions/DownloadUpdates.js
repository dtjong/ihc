export function downloadUpdatesHelper(realm, fetchUrl) {
  let settings = realm.objects('Settings')['0'];

  const lastSynced = settings ? settings.lastSynced : 0;

  // TODO: Fetch call to server, passing in lastSynced value
  return fetch(fetchUrl + '/route/' + lastSynced)
    .then(response => response.json())
    .then(json => {
      const patients = json.patients;
      return handleDownloadedPatients(patients, settings, realm);
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
function handleDownloadedPatients(patients, settings, realm) {
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
        promises.push(updateObject(existingPatient, 'soaps', incomingSoap, realm));
      });
      incomingPatient.triages.forEach(incomingTriage => {
        promises.push(updateObject(existingPatient, 'triages', incomingTriage, realm));
      });
      incomingPatient.medications.forEach(incomingDrugUpdate => {
        promises.push(updateObject(existingPatient, 'medications',
            incomingDrugUpdate, realm));
      });
      incomingPatient.statuses.forEach(incomingStatus => {
        promises.push(updateObject(existingPatient, 'statuses', incomingStatus, realm));
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

/**
 * Type: string of either 'soaps', 'triages', 'medications', or 'statuses'
 * Returns true Promise if updated successfully, false if wasn't updated
 */
function updateObject(existingPatient, type, incomingObject, realm) {
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
