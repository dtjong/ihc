export function getPatientHelper(patientKey, realm, fetchUrl) {
  const patient = realm.objects('Patient').filtered('key = "' + patientKey + '"');
  if(!patient) {
    return Promise.reject(new Error('Patient does not exist'));
  }
  return Promise.resolve(patient['0']);
}
