export function getPatientHelper(patientKey, realm, fetchUrl) {
  const patient = realm.objects('Patient').filtered('key = "' + patientKey + '"');
  if(!patient) {
    return Promise.reject(new Error('Patient does not exist'));
  }
  return Promise.resolve(patient['0']);

  return fetch(fetchUrl+ '/patient' + patientKey, {
  	method: "GET",
  	headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
	}).then((response)=>{response.json()})
  	.then((obj)=>{
  		if(!obj.status){
  			throw new Error(obj.error);
  		}
  		return Promise.resolve(obj.patient);
  	}).catch((err)=>{
  		return Promise.reject(err);
  	});
}
