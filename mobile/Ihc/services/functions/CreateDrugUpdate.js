export function createDrugUpdateHelper(update, realm, fetchUrl) {
  try {
    const patientObjs = realm.objects('Patient').filtered('key = "' + update.patientKey + '"');
    const patient = patientObjs['0'];
    if(!patient) {
      throw new Error("Patient doesn't exist");
    }

    const timestamp = new Date().getTime();
    update.lastUpdated = timestamp;

    realm.write(() => {
      patient.lastUpdated = timestamp;
      // If an object for that drug and date already exists, update it
      for (var m in patient.medications) {
        const old = patient.medications[m];
        if(old.date === update.date && old.name === update.name) {
          old.dose = update.dose;
          old.frequency = update.frequency;
          old.duration = update.duration;
          old.notes = update.notes;
          old.lastUpdated = update.lastUpdated;
          return Promise.resolve(true);
        }
      }

      // If doesn't exist, then add it
      patient.medications.push(update);
    });
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}

