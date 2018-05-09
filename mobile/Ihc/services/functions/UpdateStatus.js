// field: Any of fields from Status.schema
// value: should match the type that the Status.schema says
export function updateStatusHelper(patientKey, strDate, field, value, realm, fetchUrl) {
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
