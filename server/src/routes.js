import express from 'express';

import PatientController from './controllers/Patient';

const router = express.Router();

//COMPLETE
//Create New Patient
router.post('/patient', PatientController.CreatePatient);
// router.delete('/patient/:key', PatientController.DeletePatient);

//COMPLETE
//Gets Singular Patient
router.get('/patient/:key', PatientController.GetPatient);


//returns an array of patients that have been updated since the lastUpdated
//timestamp. If all patients are wanted, then pass a timestamp of 0
router.get('/patients/:lastUpdated', PatientController.GetPatients);

router.post('/patient', PatientController.CreatePatient);
// router.delete('/patient/:key', PatientController.DeletePatient);

//updates patient's personal info
//everything except doctors assessment, ie: name, phone number, age
router.put('/patient/:key', PatientController.UpdatePatient);

// receive patients from the tablet and save them to the server, or update the
// existing server-side objects if they already exist
// Differently than UpdatePatient, this route DOES modify doctors assessments
router.put('/patients', PatientController.UpdatePatients);

//COMPLETE
//get soap info
router.get('/patient/:key/soap/:date', PatientController.GetSoap);


//COMPLETE
//Kenny
//get status info
router.get('/patient/:key/status/:date', PatientController.GetStatus);

//COMPLETE
//get triage info
router.get('/patient/:key/triage/:date', PatientController.GetTriage);

//COMPLETE
//get drug info
router.get('/patient/:key/drugUpdates', PatientController.GetDrugUpdates);

//Kenny
//updates the soap of the patient
router.put('/patient/:key/soap/:date', PatientController.UpdateSoap);

//Kenny
//updates the status of the patient
router.put('/patient/:key/status/:date', PatientController.UpdateStatus);

//TO DO
//updates the triage of the patient
router.put('/patient/:key/triage/:date', PatientController.UpdateTriage);

//TO DO
//updates the Medicine of the patient
router.put('/patient/:key/drugUpdate/:date', PatientController.UpdateDrugUpdate);

// return all the statuses for the given date
router.get('/patients/statuses/:date', PatientController.GetStatuses);

//adds a new medication to the inventory
router.post('/medication-inventory', PatientController.CreateMedication);

//return all the medications (varying expiration dates) for the given drug name
router.get('/medication-inventory/:name', PatientController.GetMedications);

//updates the information for an existing medication
router.put('/medication-inventory/:name/update', PatientController.UpdateMedication);

//deletes the information for an existing medication
router.put('/medication-inventory/:name/delete', PatientController.DeleteMedication)

module.exports = router;
