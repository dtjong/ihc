import express from 'express';

import PatientModel from './models/Patient';
import SoapModel from './models/Soap';
import StatusModel from './models/Status';
import TriageModel from './models/Triage';
import DrugUpdateModel from './models/DrugUpdate';

import PatientController from './controllers/Patient';

const router = express.Router();

//COMPLETE
//Create New Patient
router.post('/patient', PatientController.CreatePatient);
// router.delete('/patient/:key', PatientController.DeletePatient);

//COMPLETE
//Gets Singular Patient
router.get('/patient/:key', PatientController.GetPatient);

//COMPLETE
//returns an array of patients
router.get('/patients', PatientController.GetPatients);

//COMPLETE
//updates patient's personal info, everything except doctors assessment, ie: name, phone number, age
router.patch('/patient/:key', PatientController.UpdatePatient);

//COMPLETE
// Return the updates that occurred since a given timestamp
router.get('/updates/:timestamp', PatientController.GetUpdates);

//COMPLETE
//get soap info
router.get('/patient/:key/soap/:date', PatientController.GetSoap);

//COMPLETE
//get status info
router.get('/patient/:key/status/:date', PatientController.GetStatus);

//COMPLETE
//get triage info
router.get('/patient/:key/triage/:date', PatientController.GetTriage);

//COMPLETE
//get drug info
router.get('/patient/:key/drugUpdates', PatientController.GetDrugUpdates);

//Update Functions also add the object if it does not exist**

//COMPLETE
//updates the soap of the patient
router.patch('/patient/:key/soap/:date', PatientController.UpdateSoap);

//TO DO
//Update status of the visit
router.patch('/patient/:key/status/:date', PatientController.UpdateStatus);

//TO DO
//updates the triage of the patient
router.patch('/patient/:key/triage/:date', PatientController.UpdateTriage);

//TO DO
//updates the Medicine of the patient
router.patch('/patient/:key/drugUpdates', PatientController.UpdateDrugUpdates);

module.exports = router;

/*
module.exports = function(app, db) {
  app.get("/patients", (req,res,next) => {
    const onlyCheckedInPatients = req.query.checkedin === 'true';
    const includeForms = req.query.forms === 'true';
    db.getPatients(onlyCheckedInPatients, includeForms, (patients) => {
      res.send({patients: patients});
    }, next);
  });

  app.get("*", (req,res,next) => {
    //res.send("Error: No path matched");
    next(new Error('No path matched for URL: ' + req.originalUrl));
  });

  app.post("/signout", (req,res,next) => {
    db.signoutEveryone((result) => {
      res.send(result);
    }, next);
  });
*/
  /* =========================================================================
   * All routes below this line expect a patientInfo object in the req.body
   */
/*
  // Assert that the param for req.body.patient info exists
  const expectPatientInfoParam = function(req, res, next) {
    if(!req.body.patientInfo) {
      next(new Error('Expected a patientInfo object for path: ' + req.originalUrl));
    }
    next();
  }
  app.use(expectPatientInfoParam);

  app.post("/signin/newpatient", (req,res,next) => {
    db.patientExists(req.body.patientInfo, (exists) => {
      if(!exists) {
        db.createPatient(req.body.patientInfo, () => {
          db.patientSignin(req.body.patientInfo, () => res.send(true), next)
        }, next);
      } else {
        res.send(false);
      }
    }, next); 
  });

  app.post("/signin", (req,res,next) => {
    db.patientExists(req.body.patientInfo, (exists) => {
      if(!exists) {
        res.send(false);
      } else {
        db.patientSignin(req.body.patientInfo, () => res.send(true), next);
      }
    }, next);
  });

  app.patch("/status", (req,res,next) => {
    const patientInfo = req.body.patientInfo;
    const newStatus = req.body.status;
    db.updateStatus(patientInfo, newStatus, (result) => {
      // Extract if update was successful
      res.send(result);
    }, next);
  });

  app.patch("/patients/soap", (req,res,next) => {
    const patientInfo = req.body.patientInfo;
    const newSoap = req.body.soap;
    db.updateSoap(patientInfo, newSoap, (result) => {
      res.send(result);
    }, next);
  });

  app.patch("/patients/triage", (req,res,next) => {
    const patientInfo = req.body.patientInfo;
    const newTriage = req.body.triage;
    db.updateTriage(patientInfo, newTriage, (result) => {
      res.send(result);
    }, next);
  });

  app.post("/patients/growthchartupdate", (req,res,next) => {
    const patientInfo = req.body.patientInfo;
    const update = req.body.update;
    db.addGrowthChartUpdate(patientInfo, update, (result) => {
      res.send(result);
    }, next);
  });
}
*/




// OLD FIREBASE STUFF BELOW, delete when not necessary
/*
app.get("/groups/:group/all/:timestamp", (req, res) => {
  const groupId = req.params.group;
  const timestampParam = parseInt(req.params.timestamp);
  const excludeTimestamps = req.query.exclude;

  // :timestamp should be a number, but wasn't
  if(Number.isNaN(timestampParam)) {
    res.status(400).send({
      error: 'Invalid "' + req.params.timestamp + ' passed as timestamp'
    });
  }

  // Grab list of timestamps from groups/:groupid/timestamps
  const timestampRef = db.ref(`/groups/${groupId}/timestamps`);

  timestampRef.once("value")
    .then(snapshot => snapshot.val())
    // Only care about timestamps after the passed in time
    // and filter out keys that are labeled as exclude
    .then(keysObj => Object.keys(keysObj)
        .filter(key => {
          const currTimestamp = keysObj[key];
          if(currTimestamp < timestampParam)
            return false;

          if(Array.isArray(excludeTimestamps)) {
            return excludeTimestamps.indexOf(currTimestamp.toString()) === -1;
          }
          else {
            return excludeTimestamps !== currTimestamp;
          }
        }),
        error => [])
    // Build list of promises of updateKey to resolve
    .then(timestampKeys => {
        let promises = [];
        const updateRef = db.ref(`/groups/${groupId}/updates/timestamp`);
        timestampKeys.forEach(timestampKey=> {
          const currRef = updateRef.child(`/${timestampKey}`);
          promises.push(currRef.once("value"));
        });
        return Promise.all(promises);
    })
    .then(snapshots => snapshots.map(snapshot => snapshot.val()))
    // Have updateKeyObjs, extract updateKey and combine into one list
    .then(objs =>
      objs.reduce( (total, curr) => total.concat(Object.keys(curr)), [] )
    )
    // For each updateKey, get the actual update promise
    .then(updateKeys => {
        let promises = [];
        const updateRef = db.ref(`/groups/${groupId}/updates/`);
        updateKeys.forEach(updateKey => {
          const currRef = updateRef.child(`/${updateKey}`);
          promises.push(currRef.once("value"));
        });
        return Promise.all(promises);
    })
    .then(updates => {
        res.status(200).send({updates: updates});
    }, error => { res.status(500).send({error: 'Error: ' + error}); });
});

app.patch("/groups/:group/all", (req, res) => {
  const groupId = req.params.group;

  // When the "Send updates" button was clicked
  const timestamp = req.body.timestamp;
  // List of user updates
  const userUpdates = req.body.user_updates;

  firebase.addUpdates(userUpdates, groupId, db, timestamp)
    .then( () => res.send(true), (error) => res.status(500).send({error: error}))
});
*/

/*
app.post("/groups/:group/newpatient", (req, res) => {
  const groupId = req.params.group;
  const personId = `${req.body.firstname}${req.body.lastname}${req.body.birthday}`;
  console.log("post /group/newpatient to person " + personId);

  const ref = db.ref(`/${groupId}/${personId}`);
  ref.push(extractData(req.body));
  res.send(true);
});
*/

/*
app.get("/groups/:group/:id", (req, res) => {
  res.send("patch /groups/:group/:id")
});

app.post("/groups/:group", (req, res) => {
  res.send("patch /groups/:group/all")
});

app.patch("/groups/:group/:id", (req, res) => {
  res.send("patch /groups/:group/:id")
});

function extractData(body) {
  return {firstname: body.firstname, lastname: body.lastname, birthday: body.birthday};
}
*/
