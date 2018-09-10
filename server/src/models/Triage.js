import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const TriageSchema = Schema({
  patientKey: String,
  date: String,
  age: Number,
  hasInsurance: Boolean,
  location: String, // Girasoles or TJP or somewhere else
  arrivalTime: Number, // should match checkin time from Status
  timeIn: String,
  timeOut: String,
  triager: String, // Name of triager
  status: String, // EMT, Student, Nurse, Other
  statusClarification: String, // If Other status, explain
  weight: Number,
  height: Number,
  temp: Number,
  rr: Number,
  o2: Number,
  bp: String,
  hr: Number,
  history: String,
  allergies: String,
  medications: String,
  surgeries: String,
  immunizations: String,
  chiefComplaint: String,
  pharmacySection: String,
  //---IF FEMALE---
  LMP: String,
  regular: Boolean,
  pregnancies: String,
  liveBirths: String,
  abortions: String,
  miscarriages: String,
  //---END IF---
  //---IF LABS DONE---
  labsDone: Boolean,
  bgl: String,
  a1c: String,
  fasting: Boolean,
  pregnancyTest: String,
  //--END IF---
  //---IF URINE TEST---
  urineTestDone: Boolean,
  leukocytes: String,
  blood: String,
  nitrites: String,
  specificGravity: String,
  uroglobin: String,
  ketone: String,
  protein: String,
  bilirubin: String,
  ph: String,
  glucose: String,
  //---END IF---
  lastUpdated: Number // timestamp
});
const TriageModel = mongoose.model('Triage', TriageSchema);
module.exports = TriageModel;
