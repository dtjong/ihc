import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const MedicationSchema = Schema({
  drugName: String,
  expirationDate: String, //to distinguish between different shipments
  quantity: Number,
  dosage: Number,
  units: String,
  comments: String
});

const MedicationModel = mongoose.model('Medication', MedicationSchema);
module.exports = MedicationModel;
