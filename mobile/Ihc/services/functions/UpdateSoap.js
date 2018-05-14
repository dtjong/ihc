import Soap from '../../models/Soap';

export function updateSoapHelper(update, realm, fetchUrl) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];

    if(!patient) {
      throw new Error('Patient doesn\'t exist');
    }

    const timestamp = new Date().getTime();
    update.lastUpdated = timestamp;

    const soap = realm.objects('Soap').filtered('date = "' +
        stringDate(new Date) + '" AND patientKey = "' + update.patientKey +
        '"')['0'];

    realm.write(() => {
      patient.lastUpdated = timestamp;
      // If an object for that date already exists, update it
      if(soap) {
        const properties = Object.keys(Soap.schema.properties);
        properties.forEach( p => {
          soap[p] = update[p];
        });
        soap.lastUpdated = new Date().getTime();
        return Promise.resolve(true);
      }

      // If doesn't exist, then add it
      patient.soaps.push(update);
    });
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}
