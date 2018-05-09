export function uploadUpdatesHelper(realm, fetchUrl) {
  // const patients = Object.values(realm.objects('Patient').filtered('needToUpload = true'));
  const patients = Object.values(realm.objects('Patient'));
  // TODO: Fetch call to server
  fetch('route/', {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patients: patients
    }),
  }).then(response => {
    return Promise.resolve(true);
  }).catch(err => {
    return Promise.reject(err);
  });
}
