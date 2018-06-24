import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const MedicationCheckmarksSchema = Schema({
  patientKey: String,
  drugName: String,
  date: String,
  taking: Boolean,
  notTaking: Boolean,
  incorrectly: Boolean,
  lastUpdated: Number // timestamp
});
const MedicationCheckmarksModel = mongoose.model('MedicationCheckmarks', MedicationCheckmarksSchema);
module.exports = MedicationCheckmarksModel;
