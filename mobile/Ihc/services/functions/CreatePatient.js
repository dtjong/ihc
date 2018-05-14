import Status from '../../models/Status';

export function createPatientHelper(patient, realm, fetchUrl) {
  const timestamp = new Date().getTime();
  const patientObjs = realm.objects('Patient').filtered('key = "' + patient.key + '"');
  const existingPatient = patientObjs['0'];

  // Also sign them in
  const statusObj = Status.newStatus(patient);

  statusObj.lastUpdated = timestamp;
  patient.lastUpdated = timestamp;

  try {
    if(existingPatient) {
      throw new Error('Patient already exists');
    }

    // Write results locally
    realm.write(() => {
      patient.statuses = [statusObj];
      realm.create('Patient', patient);
    });
  } catch (e) {
    realm.write(() => {
      patient.needToUpload = true;
    });
    return Promise.reject(e);
  }

  // Send results to server
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
    // some kind of error when processing the request. Throwing an error here
    // will lead to patient.needToUpload being marked as true
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
    // If there was an error updating, then mark this patient as needing to
    // upload again later
      realm.write(() => {
        patient.needToUpload = true;
      });
      return Promise.reject(err);
    });
}
