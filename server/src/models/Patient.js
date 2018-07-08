import mongoose from 'mongoose';

import DrugUpdateModel from './DrugUpdate';
import SoapModel from './Soap';
import TriageModel from './Triage';
import StatusModel from './Status';

const Schema = mongoose.Schema;
const PatientSchema = Schema({
  key: String, // A unique identifier created from front end
  firstName: String,
  fatherName: String, // last name
  motherName: String, // last name
  birthday: String,
  gender: Number, // 1 = boy, 2 = girl, 0 = undefined
  phone: String,
  motherHeight: Number,
  fatherHeight: Number,
  drugUpdates: [DrugUpdateModel.schema],
  soaps: [SoapModel.schema],
  triages: [TriageModel.schema],
  statuses: [StatusModel.schema],
  lastUpdated: Number // timestamp
});
const PatientModel = mongoose.model('Patient', PatientSchema);
module.exports = PatientModel;
