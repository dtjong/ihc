export function getSoapHelper(patientKey, strDate, realm, fetchUrl) {
  const soap = realm.objects('Soap').filtered('date = "' +
      stringDate(new Date) + '" AND patientKey = "' + patientKey + '"')['0'];
  return Promise.resolve(soap);
}
