import Patient from '../../models/Patient';
import Status from '../../models/Status';

export function signinPatientHelper(patientForm, realm, fetchUrl) {
  const key = Patient.makeKey(patientForm);
  const patientObjs = realm.objects('Patient').filtered('key = "' + key + '"');
  const patient = patientObjs['0'];

  if(!patient) {
    return Promise.reject(new Error('Patient doesn\'t exist'));
  }

  if(Object.keys(patientObjs).length > 1) {
    return Promise.reject(new Error('More than one patient with key' + patientForm.key));
  }

  const timestamp = new Date().getTime();
  const statusObj = Status.newStatus(patientForm);
  statusObj.lastUpdated = timestamp;

  for ( var k in patient.statuses ){
    if(patient.statuses[k].date === statusObj.date) {
      return Promise.reject(new Error('This patient already checked in'));
    }
  }

  try {
    realm.write(() => {
      patient.statuses.push(statusObj);
    });
  } catch (e) {
    return Promise.reject(e);
  }

  return fetch(fetchUrl + `/patient/${patient.key}/status/${statusObj.date}`, {
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
    // If there was an error updating, then mark this patient as needing to
    // upload again later
      realm.write(() => {
        patient.needToUpload = true;
      });
      return Promise.reject(err);
    });
}
