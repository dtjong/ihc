import Triage from '../../models/Triage';

export function updateTriageHelper(update, realm, fetchUrl) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];

    if(!patient) {
      throw new Error('Patient doesn\'t exist');
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
