import {stringDate} from '../../util/Date';

export function getPatientSelectRowsHelper(realm, fetchUrl) {
  const statuses = Object.values(realm.objects('Status').filtered('date = "' +
      stringDate(new Date) + '" AND active = true').sorted('checkinTime'));

  const columnOrder = ['name', 'birthday', 'checkinTime', 'triageCompleted',
    'doctorCompleted', 'pharmacyCompleted', 'notes', 'patientKey'];
  const toReturn = createMatrix(statuses, columnOrder);

  return Promise.resolve(toReturn);
}

function createMatrix(data, columnOrder) {
  return data.map((obj) => columnOrder.map( (key) => obj[key] ));
}
