import Patient from '../../models/Patient';
import Status from '../../models/Status';

export function signinPatientHelper(patientForm, realm, fetchUrl) {
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
