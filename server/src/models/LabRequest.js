import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const LabRequestSchema = Schema({
  key: String,
  patientKey: String,
  testType: String,
  dateRequested: String,
  dateCompleted: String,
  lastUpdated: Number
});
const LabRequestModel = mongoose.model('LabRequest', LabRequestSchema);
module.exports = LabRequestModel;
