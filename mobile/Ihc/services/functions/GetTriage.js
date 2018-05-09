export function getTriageHelper(patientKey, strDate, realm, fetchUrl) {
  const triage = realm.objects('Triage').filtered('date = "' +
      stringDate(new Date) + '" AND patientKey = "' + patientKey + '"')['0'];
  return Promise.resolve(triage);
}
