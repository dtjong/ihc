import {stringDate} from '../util/Date';
import Patient from './Patient';
/*
 * A patient's status as they go through their appointment
 */
export default class Status {
  // Insert any class methods here

  static newStatus(patient) {
    const obj = {
      patientKey: patient.key,
      name: Patient.fullName(patient),
      birthday: patient.birthday,
      date: stringDate(new Date()),
      active: true,
      checkinTime: new Date().getTime(),
      lastUpdated: new Date().getTime(),
    };
    return obj;
  }
}

Status.schema = {
  name: 'Status',
  properties: {
    patientKey: 'string',
    name: 'string',
    birthday: 'string', // For convenience in patient select table
    date: 'string',
    active: 'bool',
    checkinTime: 'int', // Timestamp, milliseconds
    triageCompleted: 'int?', // timestamp for when completed
    doctorCompleted: 'int?',
    pharmacyCompleted: 'int?',
    notes: 'string?',
    lastUpdated: 'int',
  }
};
