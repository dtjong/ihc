export function getMedicationUpdatesHelper(patientKey, realm, fetchUrl) {
  const updates = Object.values(realm.objects('DrugUpdate').filtered('patientKey = "' +
      patientKey + '"'));
  return Promise.resolve(updates);
}
